
import mongoose from 'mongoose';
import User from '../UserProvider/User.js';
import Balance from './Balance.js';
class Exception {
    constructor(err, msg) {
        this.msg = msg;
        this.err = err;
    }
}

class DefaultBalanceProvider {

    constructor() {
        this.balances = {}
        console.debug("DEBUG DefaultBalanceProvider")
        const BalancesSchema = new mongoose.Schema({
            id_user: { type: String, index: true },
            balance: String
        });

        this.BalancesModel = mongoose.model("balances", BalancesSchema);
    }
    /**
     * obtener balanace de usuario
     * @param {User} user 
     * @returns {Promise<Balance>}
     */
    async getOf(user) {
        var balance = await this.BalancesModel.findOne({ id_user: user.id });
        if (balance == null)
            balance = await new this.BalancesModel({ id_user: user.id, balance: "0.0" }).save();
        return new Balance(balance.balance);
    }

    /**
     * Eliminar balance a un usuario
     * 
     * @param {User} user 
     * @param {Float} amount 
     * @returns Balance
     * 
     */
    async transferFrom(user, amount) {
        var balance = await this.BalancesModel.findOne({ id_user: user.id });
        if (balance == null) {
            throw new Exception("balance_no_found", "no se encontro balance de user.id " + user.id);
        }
        if (balance.balance < amount) {
            console.log("transferFrom sin fondos");
            throw new Exception("no_funds","sin fondos");
        }


        //console.log("DEBUG usuario " + user.email + ", se le restara la cantidad " + amount + " tiene " + balance.balance);
        balance.balance = (parseFloat(balance.balance) - amount).toString();
        
       
        await balance.save();
        //console.log("DEBUG usuario " + user.email + ", se le resto la cantidad " + amount + " tiene " + balance.balance);

        return new Balance(balance.balance);
    }
    /**
     * Agregar balance a un usuario
     * 
     * @param {User} user 
     * @param {Float} amount 
     */
    async transferTo(user, amount) {
        if (amount == 0) return;
        var balance = await this.BalancesModel.findOne({ id_user: user.id });
        if (balance == null) {
            throw new Exception("balance_no_found", "no se encontro balance de user.id " + user.id);
        }
        //var balance = (await this.getOf(user));

        // console.log("DEBUG usuario " + user.email + ", se le sumara la cantidad " + amount + " tiene " + balance.balance);
        balance.balance = (parseFloat(balance.balance) + amount).toString();
       
        
        
        await balance.save();
        //console.log("DEBUG usuario " + user.email + ", se le sumo la cantidad " + amount + " tiene " + balance.balance);

        return new Balance(balance.balance);
    }
}

export default DefaultBalanceProvider;