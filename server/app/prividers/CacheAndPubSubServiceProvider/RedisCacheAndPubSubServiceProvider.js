import "dotenv/config";
import { createClient } from 'redis';

import ICacheAndPusSubProvider from "./ICacheAndPusSubProvider.js";
import Cache from "./Cache.js";
import Manager from "../../managers/Manager.js";
import { Payload } from "../RealTimeProvider/Payload.js";
import { SlotGame } from "../SlotGameProvider/SlotGame.js";
import User from "../UserProvider/User.js";
import Inovice from "../InoviceProvider/Inovice.js";
import Balance from "../BalanceProvider/Balance.js";
import { ConnectionsUser } from "../RealTimeProvider/DefaultRealTimeProvider.js";
function rand(_min, _max) {
    return Math.round(Math.random() * (_min - _max) + _max);
}

class Item {
    constructor({ type, channel, listener = null, payload = null } = {}) {
        this.type = type;
        this.channel = channel;
        this.listener = listener;
        this.payload = payload;

    }
}
class Queue {

    constructor() {
        /**
         * @type {Item[]}
         */
        this.dataStore = Array.prototype.slice.call(arguments, 0);

    }
    /**
     * agregar a la cola
     * @param {Item} item 
     */
    enqueue(item) {
        this.dataStore.push(item);
    }
    /**
     * obtener de la cola
     * @returns {Item}
     */
    dequeue() {
        return this.dataStore.shift();
    }
    /**
     * limpiar
     * @returns {Item[]}
     */
    empty() {
        return this.dataStore = [];
    }

    print(element) {
        this.dataStore.forEach(function (item) {
            // element.appendChild(item.node);
            console.log(item);
        });
    }
}

/**
 * @callback Serialize
 * @param {Object} data 
 */
/**
* @callback Deserialize
* @param {Object} data 
*/

/**
 * 
 */
class RedisCache extends Cache {
    constructor(name) {
        super();
        this.provider = Manager.getCacheAndPubServiceProvider();
        this.name = name
        this.options = {
            EX: 60,//1 minuto
            //NX: true
        }
        /**
         * @type Serialize
         */
        this.serialize = JSON.stringify;
        /**
         * @type Deserialize
         */
        this.deserialize = JSON.parse;
    }

    async get(key) {
        return this.provider.client.get(this.name + ":" + key)
            .then(d => {
                if (d == null) return null;
                return this.deserialize(d);
            })
        let value = await this.provider.client.get(this.name + ":" + key);
        if (value == null) return null
        return this.deserialize(value);
    }

    async put(key, value) {
        return this.provider.client.set(this.name + ":" + key, this.serialize(value), this.options);
    }

    /**
     * 
     * @param {Serialize} serialize 
     */
    setSerialize(serialize) {
        this.serialize = serialize;
    }

    /**
     * 
     * @param {Deserialize} deserealize 
     */
    setDeserialize(deserealize) {
        this.deserialize = deserealize
    }

}
export default class RedisCacheAndPubSubServiceProvider extends ICacheAndPusSubProvider {

    constructor() {
        super();
        console.log("DEBUG RedisCacheAndPubSubServiceProvider");
        this.client = null;
        this.initialized = false;
        this.queue = new Queue();
        this.id = rand(0, 10000);
        this.ignore_miself = JSON.parse(process.env.PUBSUB_IGNORE_MI_SELF)

        this.init().then(() => {

            let item = this.queue.dequeue();
            // console.log(item)
            while (item != undefined) {
                console.log("DEBUG aplicando elementos pendientes.");
                console.log("DEBUG  - aplicando item", item);
                if (item.type == "subscribe") {

                    this.subscribe(item.channel, item.listener);
                }

                if (item.type == "unsubscribe") {
                    this.unsubscribe(item.channel);
                }

                if (item.type == "publish") {
                    const payload = JSON.stringify(JSON.parse(item.payload).payload);
                    this.publish(item.channel, payload);
                }
                item = this.queue.dequeue();
            }

            console.log("DEBUG RedisCacheAndPubSubServiceProvider initialized id:", this.id);


        });
    }

    async init() {
        this.client = createClient();
        this.client.on('error', (err) => console.log('Redis Client Error', err));
        await this.client.connect();

        this.subscriber = this.client.duplicate();
        await this.subscriber.connect();
        console.log("DEBUG  - subscriber connected")


        this.publisher = this.client.duplicate();
        await this.publisher.connect();
        console.log("DEBUG  - publishe connected")
        this.initialized = true;

        //añadimos observador de slotgame
        Manager.getSlotGameProvider().attach(this);

        //add observer to inovice provider observable
        Manager.getInoviceProvider().attach(this)


        //add ibserve to realtime provider obserbavle
        //Manager.getRealTimeProvider().attach(this)



        //add observer to withdraw provider
        Manager.getAsyncWithDrawFactory().attach(this)
    }

    /**
   * 
   * @param {string} name 
   * @param {number} capacity 
   * @returns {Promise<Cache>}
   */
    async createCache(name, capacity) {
        const cache = new RedisCache(name);

        return cache;
    }
    /**
     * 
     * @param {string} name 
     * @param {number} capacity 
     * @returns {Promise<Cache>}
     */
    async getCache(name, capacity = process.env.CACHE_CAPACITY || 100) {
        return this.createCache(name, capacity);
    }


    /**
    * This callback type is called `EventMessage` and is displayed as a global symbol.
    *
    * @callback EventMessage
    * @param {string} message
    * @param {string} channel
    *  
    */

    /**
     * Does something asynchronously and executes the callback on completion.
     * @param {string} channel
     * @param {EventMessage} listener - The listener that handles the response.
     * @returns {Primise<string>} channel
     */
    async subscribe(channel, listener) {
        console.log("DEBUG channel subscribe: " + channel)
        if (this.initialized == true) {

            try {
                await this.subscriber.subscribe(channel, (message, _c) => {

                    const data = JSON.parse(message);
                    if (this.ignore_miself) {
                        if (data.sid != this.id) {
                            console.log("DEBUG      -message recibed ", data)

                            try {
                                listener(data.payload, _c);
                            } catch (error) {
                                console.error("ERROR error al ejecutar listener de subscripcion", error)
                            }
                        }
                    }


                });
            } catch (error) {
                console.log("ERROR unsubscribe ", error)
            }


        } else {
            console.log("WARN provider not initialized, enqueue subscribe");
            this.queue.enqueue(new Item({ type: "subscribe", channel, listener }))
        }
    }

    async unsubscribe(channel) {
        console.log("DEBUG channel unsubscribe: " + channel)

        if (this.initialized == true) {

            try {
                await this.subscriber.unsubscribe(channel);
            } catch (error) {
                console.log("ERROR unsubscribe ", error)
            }

        } else {
            console.log("WARN provider not initialized, enqueue unsubscribe")
            this.queue.enqueue(new Item({ type: "unsubscribe", channel }))
        }
    }

    async publish(channel, payload) {
        let data = {
            sid: this.id,
            payload
        }
        data = JSON.stringify(data);
        console.log("DEBUG channel publish: " + channel, data)
        if (this.initialized == true) {
            // console.log(channel, data);
            try {
                await this.publisher.publish(channel, data);
            } catch (error) {
                console.log("ERROR publis ", error)
            }


        } else {
            console.log("WARN provider not initialized, enqueue publish")
            this.queue.enqueue(new Item({ type: "publish", channel, payload: data }))
        }

    }


    //observer 

    /**
    * observador de slotgame
    * @param {SlotGame} slotgame 
    */
    newWinAll(slotgame) {
        const payload = new Payload("user_win", { bet: slotgame });

        //broad cast a los demas servidores
        this.publish("BROAD_CAST", JSON.stringify(payload));
    }

    /**
    * observador de slotgame
    * @param {SlotGame} slotgame 
    */
    newNotifyToUser(slotgame) {
        Manager.getBalanceProvider().getOf(slotgame.user).then(balance => {
            const payload = new Payload("balance", { balance });

            //realtime
            this.publish("realtime:" + slotgame.user.id, JSON.stringify(payload))
        }).catch(err => console.log("ERROR ", err));

    }

    /**
    * observer Inovice provider
    * @param {User} user
    * @param {Inovice} inovice 
    */
    inovicePayToUser(user, inovice) {

        Manager.getBalanceProvider().getOf(user).then(balance => {
            const payload = new Payload("balance", { balance });

            //realtime
            this.publish("realtime:" + user.id, JSON.stringify(payload))

            const payload2 = new Payload("inovice", { inovice });

            this.publish("realtime:" + user.id, JSON.stringify(payload2))
        }).catch(err => console.log("ERROR ", err));
    }


    /**
     * realtime observer
    * @param {ConnectionsUser} conn_user
    * 
    */
    newConnUser(conn_user) {
        const payload = new Payload("connections", { count: conn_user.connectionsCount() });

        //realtime
        this.publish("realtime:" + conn_user.user.id, JSON.stringify(payload))
    }

    //Observadores de withdraw provider
    nofifyProcessedInovice(user, inovice) {
        Manager.getBalanceProvider().getOf(user).then(balance => {
            const payload = new Payload("balance", { balance });

            //realtime
            this.publish("realtime:" + user.id, JSON.stringify(payload))

            const payload2 = new Payload("inovice", { inovice });

            this.publish("realtime:" + user.id, JSON.stringify(payload2))
        }).catch(err => console.log("ERROR ", err));
    }
    nofifyDeclinedInovice(user, inovice) {
        Manager.getBalanceProvider().getOf(user).then(balance => {
            const payload = new Payload("balance", { balance });

            //realtime
            this.publish("realtime:" + user.id, JSON.stringify(payload))

            const payload2 = new Payload("inovice", { inovice });

            this.publish("realtime:" + user.id, JSON.stringify(payload2))
        }).catch(err => console.log("ERROR ", err));
    }

    //Observadores de withdraw provider



}
