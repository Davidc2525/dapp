import express from 'express';
import cors from 'cors'
import "dotenv/config"
//console.log(process.env)
import { graphqlHTTP } from 'express-graphql';
import api_schema from "../../graphqlSchema.js";
import { buildSchema } from 'graphql';
import Manager from "../../managers/Manager.js"
import User from "../UserProvider/User.js"
import { NotifiedUser } from "../UserProvider/User.js"
import Cache from '../CacheAndPubSubServiceProvider/Cache.js';
import { Payload } from "../RealTimeProvider/Payload.js";

let sm;
let um;
let bm;
let authm;
let inovicem;
const PORT = process.env.PORT
const SECRET = process.env.SECRET;
class App {

    constructor() {

    }

    async init() {
        sm = Manager.getSlotGameProvider();
        um = Manager.UserManager.getInstance();
        bm = Manager.BalanceManager.getInstance();
        authm = Manager.AuthManager.getInstance();
        inovicem = Manager.InoviceManager.getInstance();
        // bm.transferTo(await um.getUserByID("1655825543629"), 100);
        //bm.transferFrom(await um.getUserByID("1655825543629"), 5.20);
        //console.log(await sm.proccessAndSaveGame(await sm.getNewGame(await um.getUserByID("1655825543629"), 1.5)));
        var count_login = 0;

        var schema = buildSchema(api_schema);
        const root = {
            async login({ email, pass }) {
                //console.log("new login")

                //console.log("login ",email,pass,count_login++)
                /**
                 * 
                 * return authm.login(email, pass).then(token => {
                    return authm.verify(token).then(user => {
                        return BodySucces({ token, user });
                    }).catch(error => { return BodyError(error) });
                }).catch(error => { return BodyError(error) });
                 */
                try {
                    let token = await authm.login(email, pass);
                    const user = await authm.verify(token);

                    return BodySucces({ token, user });
                } catch (error) {
                    return BodyError(error)
                }
            },
            async promise() {
                return new Promise((res, rej) => {

                    setTimeout(() => {
                        res(25)
                    }, 1000)
                })
            },
            async byId({ id }) {
                //console.debug("ById " + id);
                const user = await um.getUserByID(id);
                if (user != null) {
                    return BodySucces({ user });
                } else {
                    return BodyError({ err: "user_no_found", msg: "usuario no existe" });
                }
            }
            ,
            async create({ email, pass }) {
                //comprobar si existe
                //TODO validaciones
                try {
                    const u_db = await um.getUserByEmail(email);
                    if (u_db != null)
                        throw { err: "user_exists", msg: "usuario ya registrado con ese email: " + email };

                    var u = new User();
                    u.email = email;
                    u.pass = pass;


                    um.createUser(u);
                    return BodySucces({ user: u });
                } catch (error) {
                    return BodyError(error ,[error])
                }

            }
            ,
            async balanceByIdUser({ id }) {
                try {
                    const user = await Manager.getUserProvider().getUserByID(id);
                    if (user != null) {

                        var balance = await bm.getOf(user);
                        console.log(user, balance)
                        return BodySucces({ balance: balance.balance })

                    } else {
                        return BodyError({ err: "user_no_found", msg: "usuario no existe" })
                    }
                } catch (error) {
                    console.log(error)
                    return BodyError(error)
                }
            },
            async balance(args, context) {
                //console.log("get balance")
                try {
                    const token = getTokenInHeader(context.req);

                    const user = await authm.verify(token);
                    //console.log(user)
                    if (user != null) {
                        var balance = await bm.getOf(user);
                        return BodySucces({ balance: balance.balance })
                    } else {
                        return BodyError({ err: "user_no_found", msg: "usuario no existe" })
                    }
                } catch (error) {
                    return BodyError(error);
                    if (error.hasOwnProperty("code")) {

                    }
                }
            }
            ,
            async newBet({ uid, amount }) {
                return;
                console.log(uid, amount)

                try {
                    const user = await um.getUserByID(uid);
                    if (user == null)
                        return BodyError("usuario invalido")

                    const bet = await sm.proccessAndSaveGame(await sm.getNewGame(user, amount));
                    const balance = await bm.getOf(user);
                    return BodySucces({ bet, balance: balance.balance })
                } catch (error) {
                    console.log(error)
                    if (error.code != undefined) {
                        //return BodyError(error)
                    }
                    return BodyError(error)
                }
            }
            ,
            async newBetToken({ amount }, context) {
                //console.log("new bet token " + amount)

                try {
                    const token = getTokenInHeader(context.req);

                    const user = await authm.verify(token);


                    const bet = await Manager.getSlotGameProvider().proccessAndSaveGame(await sm.getNewGame(user, amount));



                    const balance = 0;

                    //user.send(new Payload("balance", { balance, bet }));

                    return BodySucces({ bet })
                } catch (error) {
                   
                    return BodyError(error)
                }
            },
            async createinovice({
                amountpaid,
                amountreceived
            }, context) {
                console.log("DEBUG newateinovice")
                try {
                    const token = getTokenInHeader(context.req);

                    const user = await authm.verify(token);
                    console.log(user)
                    if (user == null)
                        return BodyError("usuario invalido")

                    let inovice = await inovicem.createInovice();

                    inovice.amountpaid = amountpaid.toString();
                    inovice.amountreceived = amountreceived.toString();
                    inovice.cunstomer = user.id;
                    inovice = await inovicem.saveInovice(inovice)

                    return BodySucces({ inovice })
                } catch (error) {
                    if (error.code != undefined) {
                        // return BodyError(error.msg)
                    }
                    return BodyError(error)
                }
            },
            async cancelinovice({ inoviceid }, context) {
                console.log("DEBUG cancelinovice " + inoviceid)
                try {
                    const token = getTokenInHeader(context.req);

                    const user = await authm.verify(token);
                    console.log(user)
                    if (user == null)
                        return BodyError("usuario invalido")


                    const inovice = await inovicem.cancelInovice(inoviceid)

                    return BodySucces({ inovice })
                } catch (error) {
                    if (error.code != undefined) {
                        //return BodyError(error.msg)
                    }
                    return BodyError(error)
                }
            },
            async inoivices() {

            },
            async setwallet({ addr }, context) {
                //console.log("setwallet ", addr);
                try {
                    const token = getTokenInHeader(context.req);

                    const user = await authm.verify(token);

                    await Manager.getUserProvider().setWalletAddress(user, addr);

                    return BodySucces({ wallet: addr })
                } catch (error) {
                    return BodyError(error)
                }

            },
            async wallet(args, context) {
                //console.log("getwallet ");
                try {
                    const token = getTokenInHeader(context.req);

                    const user = await authm.verify(token);
                    return BodySucces({ user,wallet: user.wallet_address })
                } catch (error) {
                    //console.log("csm",error)
                    return BodyError(error)
                }

            }
        }



        this.app = express();
        this.app.use(cors())
        this.app.use('/api', graphqlHTTP((req, res, next) => {
            return ({
                schema: schema,
                rootValue: root,
                graphiql: true,
                context: { /**SECRET */SECRET, req, res, next }
            })
        }));
        this.app.listen(process.env.PORT, process.env.HOST);

        //se inicia el real time server
        Manager.getRealTimeProvider().init();

        Manager.getCacheAndPubServiceProvider().subscribe("nc", (m, c) => {
            console.log(JSON.parse(m), c)
        })
        let c = await Manager.getCacheAndPubServiceProvider().createCache("david");
        c.put("name", "david")
        c.put("lass", "david")
        setInterval(async () => {
            let payload = new Payload("user_win_bet", { msg: "usuario david gano 500$" });
            // Manager.RealTimeManager.getInstance().broadCast(payload)

            c = await Manager.getCacheAndPubServiceProvider().getCache("david")
            //console.log(await c.get("name"))
            //Manager.getCacheAndPubServiceProvider().publish("realtime:1655990440568",JSON.stringify({event:"user_win",payload:{"name":"david"}}))


            const price = Manager.getBNBPriceProvider().getPrice();
            payload = new Payload("bnbprice", { price });
            Manager.getUserProvider()
                .getUserByEmail("david@gmail.com")
                .then(user => {


                    //console.log(user.send(payload), payload)
                    return user;

                }).catch(err => console.log(err))


            //Manager.RealTimeManager.getInstance().emitToUser({ id: "1655990440568" }, payload)
            //console.log(Manager.RealTimeManager.getInstance().io.engine.clientsCount)

        }, 1000)
        console.log('Running a GraphQL API server at ' + process.env.HOST + ':' + process.env.PORT + '/api');
    }
}
function BodySucces(load) {
    return { PORT, success: true, error: {}, ...load };
}

function BodyError(error,errors) {
    return { PORT, success: false, error,errors };
}

function getTokenInHeader(req, res) {
    // console.log(req);
   try{
    //if(!req.hasOwnProperty("headers")) throw { err: "headers", msg: "no se encontro cabezeras" } 
    if (req.headers.hasOwnProperty("authorization")) {
        const authHeader = req.headers.authorization;
        //console.log(authHeader)
        return authHeader.split(" ")[1];
    } else {
        throw { err: "token_miss", msg: "no se encontro cabezera authorization" }

    }
   }catch(error){
       console.log(error)
       throw error
   }

}

export default App;
