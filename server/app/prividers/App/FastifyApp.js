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
        async login(_, { email, pass }) {

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
        }
        ,
        async send_active_email(_, args, context) {
          try {
            console.log("send_active_email")
            const token = getTokenInHeader(context.reply.request);

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
            const token = getTokenInHeader(context.reply.request);

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
            const token = getTokenInHeader(context.reply.request);

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
            const token = getTokenInHeader(context.reply.request);

            const user = await authm.verify(token);


            const bet = await Manager.getSlotGameProvider().proccessAndSaveGame(await sm.getNewGame(user, amount));

            const balance = 0;

            //user.send(new Payload("balance", { balance, bet }));

            return BodySucces({ bet })
          } catch (error) {

            return BodyError(error)
          }
        },
        async createinovice(_, {
          amountpaid,
          amountreceived
        }, context) {
          console.log("DEBUG newateinovice")
          try {
            const token = getTokenInHeader(context.reply.request);

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
        async cancelinovice(_, { inoviceid }, context) {
          console.log("DEBUG cancelinovice " + inoviceid)
          try {
            const token = getTokenInHeader(context.reply.request);

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
        async inovices() {

        },
        async setwallet(_, { addr }, context) {
          //console.log("setwallet ", addr);
          try {
            const token = getTokenInHeader(context.reply.request);

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
            const token = getTokenInHeader(context.reply.request);

            const user = await authm.verify(token);
            return BodySucces({ user, wallet: user.wallet_address })
          } catch (error) {
            //console.log("csm",error)
            return BodyError(error)
          }

        }
      }
    }
    app.register(cors);


    app.register(mercurius, {
      schema: api_schema,
      resolvers,
      graphiql: true,
      path: "/api"

    })

    /**
     * formato de entrada de endpoint
     * /account/active?toke=TOKEN
     */
    app.get("/account/active", async (req, res) => {
      try {
        if (!req.query.token) return BodyError({ err: "mising_token", msg: "Token requerido." })
        await Manager.getAuthProvider().accountVerified(req.query.token);
        res.redirect('http://localhost:4000/');
        //return ({ success: true, token: req.query.token, verified: true })
      } catch (error) {
        return BodyError(error);
      }

    });



    app.listen({ port: process.env.PORT, host: process.env.HOST })
    logger.info("listen in " + process.env.PORT)

    //se inicia el real time server
    Manager.getRealTimeProvider().init();
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
