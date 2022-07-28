'use strict'

import fastify from 'fastify'
import mercurius from 'mercurius'
import cors from "@fastify/cors"
import logger from '../../../../utils/Logger.js'
import "dotenv/config"
import api_schema from "../../graphqlSchema.js";


import "dotenv/config"
import generator from "generate-password"
//console.log(process.env)
import Manager from "../../managers/Manager.js"
import User from "../UserProvider/User.js"
import { hash_pass } from '../../../../utils/Hash.js'
import Inovice, { PayMethods } from '../InoviceProvider/Inovice.js'
import InoviceServiceProducer from '../../services_produces/InoviceServiceProducer/InoviceServiceProducer.js'
let sm;
let um;
let bm;
let authm;
let inovicem;
const PORT = process.env.PORT
const SECRET = process.env.SECRET;




export default class FastifyApp {
  constructor() {

  }
  async init() {
    sm = Manager.getSlotGameProvider();
    um = Manager.UserManager.getInstance();
    bm = Manager.BalanceManager.getInstance();
    authm = Manager.AuthManager.getInstance();
    inovicem = Manager.InoviceManager.getInstance();
    const app = fastify();

    logger.info("Fastify server init")
    const resolvers = {
      Query: {
        async login(_, { email, pass }, context) {

          //console.log("token", context.reply.request.auth_token)

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
            //console.log(error)
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
        async byId(_, { id }) {
          //console.debug("ById " + id);
          const user = await um.getUserByID(id);
          if (user != null) {
            return BodySucces({ user });
          } else {
            return BodyError({ err: "user_no_found", msg: "usuario no existe" });
          }
        },
        async user(_, arg, context) {
          //console.debug("ById " + id);
          try {
            const token = (context.reply.request.auth_token);
            let user = await authm.verify(token);
            user = await um.getUserByID(user.id);
            return BodySucces({ user });

          } catch (error) {
            console.log(error)
            return BodyError(error);
          }
        }
        ,
        async send_active_email(_, args, context) {
          try {
            console.log("send_active_email")
            const token = (context.reply.request.auth_token);

            const user = await authm.verify(token);
            //if (user.active == true) return BodySucces({});
            Manager
              .getEmailServiceProducerService()
              .sendActiveAccount(user);
            return BodySucces({})

          } catch (error) {
            console.log(error)
            return BodyError(error);

          }
        },
        async forgot_pass(_, { email }, context) {
          try {
            const user = await um.getUserByEmail(email);
            const new_temp_pass = generator.generate({
              length: 25,
              numbers: true
            });
            try {
              await Manager.getUserProvider().setPass(user, (new_temp_pass));
              await Manager
                .getEmailServiceProducerService()
                .sendForgotPassworrd(user, new_temp_pass);
            } catch (error) {
              console.log("ERROR no se envio el correo de activacion de cuenta")
              console.log(error)
            }
            return BodySucces();
          } catch (error) {
            return BodyError(error);
          }
        },
        async change_pass(_, { old_pass, new_pass }, context) {
          try {
            const token = (context.reply.request.auth_token);

            const user = await authm.verify(token);

            await Manager.getAuthProvider().changePassword(user, old_pass, new_pass);

            return BodySucces({})

          } catch (error) {
            console.log(error)
            return BodyError(error);

          }
        },
        async create(_, { email, pass, username }) {


          try {
            if (email == "") return BodyError({ err: "email_reqired", msg: "email es un campo requerido" })
            if (pass == "") return BodyError({ err: "pass_reqired", msg: "pass es un campo requerido" })
            if (username == "") return BodyError({ err: "username_reqired", msg: "username es un campo requerido" })
            await um.getUserByEmail(email);
            return BodyError({ err: "user_exists", msg: "usuario ya existe con ese correo" })
          } catch (error) {
            console.log(error)
            if (error.err == "UserNoFound") {
              try {

                console.log("username", await Manager.getUserProvider().getUserByUsername(username));

                return BodyError({ err: "user_exists", msg: "usuario ya existe con ese username" })
              } catch (error) {
                console.log("username", error)
                if (error.err == "UserNoFound") {

                  //TODO validaciones de campos
                  var u = new User();
                  u.email = email;
                  u.pass = pass;
                  u.username = username;


                  um.createUser(u);

                  try {
                    await Manager
                      .getEmailServiceProducerService()
                      .sendActiveAccount(u);
                  } catch (error) {
                    console.log("ERROR no se envio el correo de activacion de cuenta")
                    console.log(error)
                  }

                  return BodySucces({ user: u });
                }
                return BodyError({ err: "server_error", msg: JSON.stringify(error) })

              }
            }

          }


        }
        ,
        async balanceByIdUser(_, { id }) {
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
        async balance(_, args, context) {
          //console.log("get balance")
          try {
            const token = (context.reply.request.auth_token);

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
        async newBet(_, { uid, amount }) {
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
        async newBetToken(_, { amount }, context) {
          //console.log("new bet token " + amount)

          try {
            const token = context.reply.request.auth_token;

            const user = await authm.verify(token);


            const bet = await Manager.getSlotGameProvider().proccessAndSaveGame(await sm.getNewGame(user, amount));

            const balance = 0;

            //user.send(new Payload("balance", { balance, bet }));

            return BodySucces({ bet, balance })
          } catch (error) {

            return BodyError(error)
          }
        },
        async test(_,{name}){
          console.log(name)
          return name;
        },
        async createinovice(_, {
          amountpaid,
          amountreceived,
          method,
          currencypaid,
          currencyreceived,
          app,
          description,
        }, context) {
          console.log("DEBUG newateinovice")
          try {
            const token = (context.reply.request.auth_token);

            const user = await authm.verify(token);
            console.log(user)
            if (user == null)
              return BodyError("usuario invalido")
            /**
             * @type {Inovice}
             */
            let inovice = await inovicem.createInovice();

            inovice.method = method;
            inovice.create = Date.now().toString();
            inovice.amountpaid = amountpaid.toString();
            inovice.amountreceived = amountreceived.toString();

            inovice.currencypaid = currencypaid;
            inovice.currencyreceived = currencyreceived;

            inovice.app = app;
            inovice.cunstomer = user.id;
            if(inovice.method == PayMethods.MOVIL){
              inovice.pricethen = Manager.getBNBPriceProvider().getPricePar("USD");
            }else{
              inovice.pricethen = Manager.getBNBPriceProvider().getPrice();
            }
            inovice = await inovicem.saveInovice(inovice)
            console.log(inovice)

            return BodySucces({ inovice })
          } catch (error) {
            console.log(error)
            if (error.code != undefined) {
              // return BodyError(error.msg)
            }
            return BodyError(error)
          }
        },
        async setrefpay(_, { inoviceid, ref_pay }, context) {
          console.log("setref",inoviceid,ref_pay)
          try {
            const token = (context.reply.request.auth_token);

            const user = await authm.verify(token);
            console.log(user)
            if (user == null)
              return BodyError("usuario invalido")


            const inovice = await inovicem.setRefPayInovice(inoviceid, ref_pay);

            return BodySucces({ inovice })
          } catch (error) {
            if (error.code != undefined) {
              //return BodyError(error.msg)
            }
            return BodyError(error)
          }
        },
        async cancelinovice(_, { inoviceid }, context) {
          console.log("DEBUG cancelinovice " + inoviceid)
          try {
            const token = (context.reply.request.auth_token);

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
        async inovices(_, { from, show }) {
          console.log(from, show)
          const inovices = [{ _id: "ascasc" }, { _id: "aksjdhsk" }];
          return BodySucces({ from, show, count: inovices.length, inovices })
        },
        async setwallet(_, { addr }, context) {
          //console.log("setwallet ", addr);
          try {
            const token = (context.reply.request.auth_token);

            const user = await authm.verify(token);

            await Manager.getUserProvider().setWalletAddress(user, addr);

            return BodySucces({ wallet: addr })
          } catch (error) {
            return BodyError(error)
          }

        },
        async wallet(_, args, context) {
          //console.log("getwallet ");
          try {
            const token = (context.reply.request.auth_token);

            const user = await authm.verify(token);
            return BodySucces({ user, wallet: user.wallet_address })
          } catch (error) {
            //console.log("csm",error)
            return BodyError(error)
          }

        },
        async withdraw(_,{amount},context){
          return BodySucces({inovice:{amountpaid:amount}})
        }
      }
    }
    app.register(cors);
    app.addHook('preHandler', (request, reply, done) => {
      if (request.headers.authorization != null) {
        const authHeader = request.headers.authorization;
        const pieces = authHeader.split(" ");
        if (pieces.length == 2) {
          request.auth_token = pieces[1];
        }
      }
      //request.auth_token = null;
      done()
    })

    app.register(mercurius, {
      schema: api_schema,
      resolvers,
      graphiql: true,
      path: "/api",

    })

    /**
     * formato de entrada de endpoint
     * /account/active?toke=TOKEN
     */
    app.get("/account/active", async (req, res) => {
      try {
        if (!req.query.token) return BodyError({ err: "mising_token", msg: "Token requerido." })
        await Manager.getAuthProvider().accountVerified(req.query.token);
        res.redirect(process.env.WEB_APP_URL);
        //return ({ success: true, token: req.query.token, verified: true })
      } catch (error) {
        return BodyError(error);
      }

    });



    app.listen({ port: process.env.PORT, host: process.env.HOST })
    logger.info("listen in " + process.env.HOST + " " + process.env.PORT)

    //se inicia el real time server
    Manager.getRealTimeProvider().init();


    //
    new InoviceServiceProducer();
  }
}


function BodySucces(load) {
  return { PORT, success: true, error: {}, ...load };
}

function BodyError(error, errors) {
  return { PORT, success: false, error, errors };
}

function getTokenInHeader(req, res) {
  // console.log(req);
  try {
    //if(!req.hasOwnProperty("headers")) throw { err: "headers", msg: "no se encontro cabezeras" } 
    if (req.headers.hasOwnProperty("authorization")) {
      const authHeader = req.headers.authorization;
      //console.log(authHeader)
      return authHeader.split(" ")[1];
    } else {
      throw { err: "token_miss", msg: "no se encontro cabezera authorization" }

    }
  } catch (error) {
    console.log(error)
    throw error
  }

}
