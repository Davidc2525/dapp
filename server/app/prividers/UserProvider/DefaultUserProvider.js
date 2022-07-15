

import IUserProvider from "./IUserProvider.js"
import mongoose from "mongoose";
import User from "./User.js";

import Bull from "bull"
import Manager from "../../managers/Manager.js";


class Exception {
    constructor(msg) {
        this.msg = msg;

    }
}
class UserNoFoundException extends Exception {
    constructor(msg) {
        super(msg);
        this.err = "UserNoFound";
    }
}

class NoModificableWalletAddressException extends Exception {
    constructor(msg) {
        super(msg);
        this.err = "no_modificable_wallet_address";
    }
}

class DefaultUserProvider extends IUserProvider {

    constructor() {
        super()
        console.log("DEBUG DefaultUserProvider")
        this.UserS = new mongoose.Schema({
            id: { type: String, index: true, unique: true },
            username: { type: String, index: true },
            email: { type: String, index: true },
            pass: String,
            wallet_address: String,
            wallet_address_is_set: Boolean
        });

        this.UserModel = mongoose.model('users', this.UserS);
        this.cola = new Bull("email");
    }

    /**
    * @returns User
    */
    async getUserByID(uid) {
        let _u = await this.UserModel.findOne({ id: uid });
        if (_u == null) throw new UserNoFoundException("no existe usuario: " + uid);
        return new User(_u);
    }

    /**
    * @type User
    */
    async getUserByEmail(email) {
        let _u = await this.UserModel.findOne({ email });
        if (_u == null) throw new UserNoFoundException("no existe usuario: " + email);
        return new User(_u);
    }
    /**
    * @type User
    */ 
     async getUserByUsername(username) {
        let _u = await this.UserModel.findOne({ username });
        if (_u == null) throw new UserNoFoundException("no existe usuario: " + username);
        return new User(_u);
    }

    /**
     * 
     * @param {User} user 
     * @returns User
     */
    async createUser(user) {
        if (user.id == null) {
            user.id = Date.now(), toString();
        }
        //TODO comprobar que el usuario no existe

        const new_user = new this.UserModel(user);
        new_user.wallet_address = "";
        new_user.wallet_address_is_set = false;
        new_user.save();

        
        return new User(user);
    }
    /**
     * 
     * @param {User} user 
     * @param {string} address 
     */
    async setWalletAddress(user, address) {
        const u = await this.getUserByID(user.id);
        if(user.wallet_address_is_set == true){
            throw new NoModificableWalletAddressException("No se puede cambiar de nuevo la direccion de la wallet.")
        }
        await this.UserModel.updateOne({ id: user.id }, { wallet_address: address,wallet_address_is_set:true }).exec();
    }




}

export default DefaultUserProvider;