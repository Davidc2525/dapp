import bcrypt from "bcrypt"
import logger from "./Logger.js";

const salt = "$2b$10$oNfUtgg8/R5oYthuin58qu"
async function hash_pass(plaint){
    return await bcrypt.hash(plaint, salt)
}
async function compare(pass,hash){
    return bcrypt.compare(pass, hash);
}
export {hash_pass,compare}

 
