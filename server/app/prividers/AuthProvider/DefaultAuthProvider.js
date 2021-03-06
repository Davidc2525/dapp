import jwt from "jsonwebtoken";
import Manager from "../../managers/Manager.js";
import User from "../UserProvider/User.js"
import { hash_pass, compare } from "../../../../utils/Hash.js"
let um;
const SECRET = "23034087";

class Exception {
    constructor(err, msg) {
        this.msg = msg;
        this.err = err;
    }
}
export default class DefaultAuthProvider {

    constructor() {
        console.log("DEBUG DefaultAuthProvider")
        //um = Manager.UserManager.getInstance();
    }
    /**
     * 
     * @param {string} email 
     * @param {string} pass 
     * @returns {Promise<string>} token
     */
    async login(email, pass) {
        if (!email) throw new Exception("invalid_email", "Email vacio.");
        if (!pass) throw new Exception("invalid_pass", "Clave vacia.");
        let u = await Manager.UserManager.getInstance().getUserByEmail(email);
        let token = null;
        if (u) {
            if (!await compare(pass, u.pass)) throw new Exception("invalid_pass", "Clave invalido");

            u.pass = null;
            token = jwt.sign({ user: u }, SECRET, { expiresIn: "1h" });
            return token;
        } else {
            //throw { code: 3, msg: "user invalid " + email }
            throw new Exception("invalid_email", "Email invalido " + email);
        }

        return token;

    }
    async changePassword(user, old_pass, new_pass) {


        if (!old_pass) throw new Exception("invalid_pass", "Clave vacia.");
        if (!new_pass) throw new Exception("invalid_pass_new_past", "Nueva clave vacia.");

        /**
         * @type User
         */
        //let u = await Manager.UserManager.getInstance().getUserByID(user.id);

        if (!await compare(old_pass, user.pass)) throw new Exception("invalid_pass", "clave actual erronea.");

        if (new_pass.length < 8) throw new Exception("invalid_pass_new_past", "Nueva clave debe tener almenos 8 caracteres");
        if (old_pass == new_pass) throw new Exception("invalid_pass", "La nueva clave no puede ser igual a la clave antigua");

        await Manager.getUserProvider().setPass(user,new_pass);

    }
    async accountVerified(token) {
        try {

            var decoded = jwt.verify(token, SECRET);

            // console.log("user id in token",decoded);
            const user = await (Manager.getUserProvider().getUserByID(decoded.id));

            await Manager.getUserProvider()
                .setActiveAccount(user, true);
            return true;
        } catch (err) {
            console.log(err)
            if (err.name == "TokenExpiredError") {
                throw new Exception("token_expired", "token expired, expired: " + err.expiredAt);
            }
            if (err.name == "JsonWebTokenError") {
                throw new Exception("invalid_token", err.message);
            }
            if (err.name == "NotBeforeError") {
                throw new Exception("invalid_token", err.message);
            }
            throw new Exception("invalid_token", "token invalido: " + err.message);
        }
    }

    /**
     * verificar token, si es valido devuelve objeto con informacion de usuario
     * @param {string} token 
     * @returns {Promise<User>}
     * @throws objeto con code de error y msg de detalle
     */
    async verify(token) {
        try {

            var decoded = jwt.verify(token, SECRET);
           
            return await (Manager.getUserProvider().getUserByID(decoded.user.id));
            return new User(decoded.user);
        } catch (err) {
            console.log(err)
            if (err.name == "TokenExpiredError") {
                throw new Exception("token_expired", "token expired, expired: " + err.expiredAt);
            }
            if (err.name == "JsonWebTokenError") {
                throw new Exception("invalid_token", err.message);
            }
            if (err.name == "NotBeforeError") {
                throw new Exception("invalid_token", err.message);
            }

            throw new Exception("invalid_token", "token invalido: " + err.message);
        }
    }


}