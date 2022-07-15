import "dotenv/config"
import Manager from "../../managers/Manager.js";
//import express from 'express'
import http from 'http'
import User from "../UserProvider/User.js";
import { Server, Socket } from "socket.io"
import { SlotGameOserver } from "../SlotGameProvider/SlotGameObservable.js";
import { Payload } from "./Payload.js";
import { SlotGame } from "../SlotGameProvider/SlotGame.js";
import { InoviceOserver } from "../InoviceProvider/InoviceObservable.js";
import Inovice from "../InoviceProvider/Inovice.js";
import { RealTimeOserver } from "./RealTimeObservable.js";
import { RealTimeObservable } from "./RealTimeObservable.js";
const PORT = process.env.REAL_TIME_PORT;
/**
 * conexion de usuario
 */
class Connection {
    /**
     * 
     * @param {Socket} _s 
     */
    constructor(_s) {
        this.id = _s.id;
        this._socket = _s;
    }
}

/**
 * conexiones sockets de usuario
 */
class ConnectionsUser {
    /**
     * 
     * @param {User} user 
     * @param {Connection} _conn 
     */
    constructor(user, _conn) {
        this.user = user;
        /**
         *  @type Connection[]
         */
        this.con = [];

        this.addCon(_conn);
    }
    /**
     * 
     * @param {Connection} _con 
     */
    addCon(_con) {
        const index = this.con.findIndex(c => c.id == _con.id);
        console.log("add con", index, _con.id)
        if (index == -1)
            this.con.push(_con);
    }
    /**
     * 
     * @param {Connection} _con 
     */
    removeCon(_con) {
        const index = this.con.findIndex(c => c.id == _con.id);
        if (index != -1)
            this.con.splice(index, 1);

        console.log("remove con", this.user.id, _con.id, this)
    }
    /**
     * 
     * @param {Connection} _con 
     * @returns Boolean
     */
    hasCon(_con) {
        const index = this.con.findIndex(c => c.id == _con.id);
        return index != -1;
    }

    connectionsCount() {
        return this.con.length;
    }
}
export { Payload, ConnectionsUser, Connection };

function multi(...baseClasses) {

    function copy(target, source) {
        for (let key of Reflect.ownKeys(source)) {
            if (['constructor', 'prototype', 'name'].indexOf(key) === -1) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            }
        }
    }

    function inherit(...args) {
        for (let b of baseClasses) {
            copy(this, new b(args));
        }
    }

    for (let base of baseClasses) {
        copy(inherit, base);
        copy(inherit.prototype, base.prototype);
    }
    return inherit;
}


/**
 * @implements {RealTimeObservable} 
 */
export default class DefaultRealTimeProvider extends SlotGameOserver {

    constructor() {
        super();

        /**
         * @type {RealTimeOserver[]}
         */
        this.observers = [];
        console.log("DEBUG DefaultRealTimeProvider");
        /**
         * Conexiones de usuario
         * user => [conn,conn]
         * @type {Map<string,ConnectionsUser>}
         */

        this._binds_ = new Map();

        /**
         * conexiones de usuario
         * @type {ConnectionsUser[]}
         * @deprecated
         */
        this._binds = {}
        /**
         * @type {Server}
         */
        this.io = null;
        this._interval_wait_server;
        this.is_ready = false;
        this.is_active = JSON.parse(process.env.REAL_TIME_ACTIVE.toLowerCase()) || false;
        this.initialized = false;
        
    }

    stop() {
        console.log("DEBUG STOPING REALTIME");

        //TODO
    }

    init() {
        if (this.initialized) return;
        console.log("DEBUG INIT DefaultRealTimeProvider");

        console.log("DEBUG - real time actived: ", this.is_active);


        if (!this.is_active) console.log("DEBUG REAL TIME NO ACTIVE FOR THIS SERVER.")
        if (this.is_active) {

            //const app = express();
            //const server = this.server;
            const server = http.createServer();
            this.io = new Server(server, {
                path: "/realtime",
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            })
            //auth
            this.io.use(async (socket, next) => {

                const token = socket.handshake.auth.token;
                if (token) {
                    try {
                        const user = await Manager.getAuthProvider().verify(token);
                        //console.log("middle", user)
                        socket.data.user = user
                        next()
                    } catch (error) {
                        console.log(error)
                        const err = new Error(error.msg);
                        err.data = error; // additional details

                        next(err);
                    }

                } else {
                    const err = new Error("not authorized");
                    err.data = { err: "token_missing", msg: "token missing" }; // additional details
                    next(err);
                }


            });

            this.io.on("connection", (socket) => {
                console.log("DEBUG  -new connection", socket.handshake.auth)

                console.log("socket.data.user", socket.data.user)

                this._bind_user_connection(socket.data.user, socket)
                    .then(conn_user => {
                       
                       // this.emitToUser(conn_user.user, new Payload("connections", { count: conn_user.connectionsCount() }));
                       // this.notifyNewConnToUser(conn_user)
                       
                        //TODO agregar logica de subscripcion a pub/sub
                        if (conn_user.connectionsCount() == 1) {

                            Manager.getCacheAndPubServiceProvider()
                                .subscribe("realtime:" + conn_user.user.id, (message, channel) => {
                                    let data = JSON.parse(message);
                                    //comprobar que el evento es de connections
                                    //y sumar las conneciones de este servidor al resultado
                                    if (data.event == "connections") {
                                        //     console.log(data.data)
                                        data.data.count += conn_user.connectionsCount()
                                    }
                                    conn_user.user.send(
                                        new Payload(data.event, data.data)
                                    )

                                })
                        }

                    })
                    .catch(err => {
                        console.log("ERROR _bind_user_connection ", err)
                    })

                socket.on("error", (err) => {
                    console.log("ERROR ", err)
                    if (err && err.message === "unauthorized event") {
                        socket.disconnect();
                    }
                });
                //
                socket.on('disconnect', () => {
                    this._find_userconn_by_socket(socket)
                        .then(conn_user => {
                            conn_user.removeCon(new Connection(socket));
                            
                            
                            //this.emitToUser(conn_user.user, new Payload("connections", { count: conn_user.connectionsCount() }));
                            //this.notifyNewConnToUser(conn_user);

                            
                            if (conn_user.connectionsCount() == 0) {


                                //eliminar subscripcion de pub/sub
                                Manager.getCacheAndPubServiceProvider()
                                    .unsubscribe("realtime:" + conn_user.user.id)
                            }
                        })
                        .catch(err => {
                            console.log("ERROR _find_userconn_by_socket", err)
                        })



                });

                //
                socket.on("user_bind", ({ user }) => {
                    console.log(socket.id)
                    //  this._bind_user_connection(user, socket)


                })

            });


            server.listen(process.env.REAL_TIME_PORT, (err) => {
                console.log("DEBIG  -real time listen in port", process.env.REAL_TIME_PORT)
                this.initialized = true;
                this.is_active = true;
                console.log("DEBUG REALTIME INITIALIZED");
            });
            /**
             * recibe notificaiones de pub/sub por el canar BROAD_CAST
             * notifica a todos los clientes conectados
             * por medio de broad cast
             */
            Manager.getCacheAndPubServiceProvider().subscribe("BROAD_CAST", (message, channel) => {
                /**
                 * @type {Payload}
                 */
                let data = JSON.parse(message);
                let p = new Payload(data.event, data.data)
                this.broadCast(p);
            });



            //añadimos observador de slotgame
            Manager.getSlotGameProvider().attach(this);

            //add observer to inovice provider observable
            Manager.getInoviceProvider().attach(this)
        }
    }

    attach(observer) {
        this.observers.push(observer);
    }
    detach() {
        //TODO
    }

    /**
     * 
     * @param {ConnectionsUser} conn_user
     * 
     */

    notifyNewConnToUser(conn_user) {
        for (let index = 0; index < this.observers.length; index++) {
            const observer = this.observers[index];
            try {
                observer.newConnUser(conn_user);
            } catch (error) {
                console.error("ERROR in observer", error)
            }

        }
    }

    /**
     * Bincular usuario a conexion
     * @param {User} user 
     * @param {Socket} _socket 
     * @returns null
     */
    async _bind_user_connection(user, _socket) {
        let conn_user = null;
        if (!this.initialized) {
            console.log("ERROR REALTIME IS NOT INITIALIZED");
            return;
        }
        if (this._binds_.has(user.id)) {
            conn_user = this._binds_.get(user.id);
            conn_user.addCon(new Connection(_socket));


        } else {
            conn_user = new ConnectionsUser(user, new Connection(_socket));
            this._binds_.set(user.id, conn_user);
        }
        return conn_user;
        console.log(this._binds_)
    }

    /**
     * buscar usuario por medio de socket
     * @param {Socket} _socket 
     * @returns {Promise<ConnectionsUser>}
     */
    async _find_userconn_by_socket(_socket) {
        if (!this.initialized) {
            console.log("ERROR REALTIME IS NOT INITIALIZED");
            return;
        }

        let uc = null;
        for (const [key, conns_user] of this._binds_.entries()) {
            const actual = conns_user;
            if (actual.hasCon(new Connection(_socket))) {
                console.log("user connection actual ", actual)
                uc = actual;
                return uc;
            }
        }
        if (uc == null) throw "No se encontro conn user con socket id: " + _socket.id;

        return uc
    }

    //TODO eliminar
    _unbind_user_connectin(_socket, user) {
        if (!this.initialized) {
            console.log("ERROR REALTIME IS NOT INITIALIZED");
            return;
        }
        if (this._binds_.has(user.id)) {
            this._binds_.get(user.id).removeCon(new Connection(_socket))
        }

    }

    isReady() { return this.is_ready; }

    /**
     * 
     * @param {Socket} socket 
     * @param {Payload} payload 
     */
    _emit(socket, payload) {
        payload.data.port = PORT;
        if (!this.initialized) {
            console.log("ERROR REALTIME IS NOT INITIALIZED");
            return;
        }
        try {
            socket.emit(payload.get_event(), payload.get_data())
        } catch (err) {
            console.log("ERROR real time provider, emit: ", err);
        }
    }
    /**
     * 
     * @param {User} user 
     * @param {Payload} payload 
     */
    async emitToUser(user, payload) {
        if (!this.initialized) {
            console.log("ERROR REALTIME IS NOT INITIALIZED");
            return;
        }
        const uc = this._binds_.get(user.id);
        if (uc) {
            uc.con.forEach(_con => {
                //_con._socket.emit(payload.get_event(),payload.get_data());
                this._emit(_con._socket, payload);
            });
        }
    }
    /**
     * 
     * @param {Payload} payload 
     */
    async broadCast(payload) {
        if (!this.initialized) {
            console.log("ERROR REALTIME IS NOT INITIALIZED");
            return;
        }
        this.io.emit(payload.get_event(), payload.get_data());

    }

    //TODO
    emitToGroup(group, payload) {
        if (!this.initialized) {
            console.log("ERROR REALTIME IS NOT INITIALIZED");
            return;
        }
    }


    //observadores

    /**
    * observador de slotgame
    * @param {SlotGame} slotgame 
    */
    newWinAll(slotgame) {
        const payload = new Payload("user_win", { bet: slotgame });
        this.broadCast(payload);
    }
    /**
       * observador de slotgame
       * @param {SlotGame} slotgame 
       */
    newNotifyToUser(slotgame) {
        Manager.getBalanceProvider().getOf(slotgame.user).then(balance => {
            const payload = new Payload("balance", { balance });

            this.emitToUser(slotgame.user, payload);
        }).catch(err => console.log("ERROR ", err));


    }
    /**
     * 
     * @param {User} user 
     * @param {Inovice} inovice 
     */
    inovicePayToUser(user, inovice) {
        Manager.getBalanceProvider().getOf(user).then(balance => {
            const payload = new Payload("balance", { balance });

            this.emitToUser(user, payload);

            const payload2 = new Payload("inovice_pay", { inovice });

            this.emitToUser(user, payload2);
        }).catch(err => console.log("ERROR ", err));

    }
} 
