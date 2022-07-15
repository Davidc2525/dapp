import express from 'express';
import cors from 'cors'
import "dotenv/config"
//console.log(process.env)
import { graphqlHTTP } from 'express-graphql';
import api_schema from "./graphqlSchema.js";
import { buildSchema } from 'graphql';
import Manager from "./managers/Manager.js"
import User from "./prividers/UserProvider/User.js"
import { Payload } from "./prividers/RealTimeProvider/Payload.js";
const sm = Manager.SlotGameManager.getInstance();
const um = Manager.UserManager.getInstance();
const bm = Manager.BalanceManager.getInstance();
const authm = Manager.AuthManager.getInstance();
const inovicem = Manager.InoviceManager.getInstance();
const SECRET = "23034087";
const input = 1;
const PORT = process.argv[2] != null ? process.argv[2] : 8080

//////////////////
/*import { createClient } from 'redis';
import mongoose from "mongoose"
const client = createClient();
await client.connect();
client.on('error', (err) => console.log('Redis Client Error', err));
 
let test = new mongoose.Schema({
    name: String
});

let test_model = mongoose.model('csm', test);
 

let c = 0;
(async () => {
    while (1) {
        let nc = new test_model({ name: "u" + (c++) });
        // await nc.save()
        await client.set("k" + c, JSON.stringify(nc));
        
        console.log(JSON.stringify(nc));
    }
})()
*/
/////////////////////////////////


try {
  await  Manager.AppManager.getInstance().init();
} catch (error) {
    console.log(error)
}
