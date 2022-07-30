
import Manager from "../../managers/Manager.js";
import Inovice, { PayMethods, State } from "./Inovice.js";

import mongoose from 'mongoose';
import { InoviceObservable } from "./InoviceObservable.js";
import "dotenv/config";
class Exception {
    constructor(err, msg) {
        this.msg = msg;
        this.err = err;

    }
}

export default class DefaultInoviceProvider extends InoviceObservable {

    constructor() {
        super()
        console.log("DEBUG DefaultInoviceProvider");

        const withdraw_crypto = new mongoose.Schema({
            address_withdraw: { type: String },
            hash: { type: String },
            created: String,
        })
        const withdraw_movil = new mongoose.Schema({
            created: { type: String },
            code_bank: { type: String },
            id_constumer: { type: String },
            phone_code: { type: String },
            phone_number: { type: String },
            ref: { type: String }
        })

        const withdraw_details = new mongoose.Schema({
            crypto: { type: withdraw_crypto },
            movil: { type: withdraw_movil },
        });

        this.InoviceS = new mongoose.Schema({
            //id: { type: String, index: true, unique: true },
            currencypaid: { type: String },
            currencyreceived: { type: String },
            create: { type: String, index: true },
            app: { type: String },
            billing_reason: { type: String },
            cunstomer: { type: String, index: true },
            description: { type: String },
            amountreceived: { type: String },
            amountpaid: { type: String },
            state: { type: String, index: true },
            method: { type: String, index: true },
            pricethen: { type: String },
            ref_pay: { type: String, index: true },
            aprobed_msg: { type: String },

            withdraw_details: { type: withdraw_details }
        });

        this.InoviceModel = mongoose.model('inovices', this.InoviceS);

        this.active = JSON.parse(process.env.INOVICE_PROVIDER_ACTIVE);
        console.log("DEBUG  -inotice provider active", this.active)
    }

    /**
     * 
     * @param {Inovice} inovice 
     * @returns {Promise<Inovice>}
     */
    async createInovice() {
        let ino = new Inovice();

        return ino;
    }
    /**
     * Persiste la factura en base de datos
     * @param {Inovice} inovice 
     * @returns {Promise<Inovice>}
     */
    async saveInovice(inovice) {
        let ino = await new this.InoviceModel(inovice);
        await ino.save()
        console.log("DEBUG      saveinovice ", inovice)

        ino = Inovice.fromInoviceModel(ino);
        console.log("DEBUG      saveinovice ", ino)

        return ino;
    }
    /**
     * 
     * @param {User} user 
     * @param {string} from 
     * @param {number} show 
     * @returns {Promise<Inovice[]>}
     */
    async loadInovices(user, from, show) {
        let inovices = [];
        let cursor;
        if (from == "TOP") {
            cursor = this.InoviceModel.find({ cunstomer: user.id }).limit(show).cursor();
        }

        if (from != "TOP") {
            cursor = this.InoviceModel.find({ cunstomer: user.id, _id: { $gt: new mongoose.Types.ObjectId(from) } })
                .limit(show)
                .cursor();
        }

        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
           // console.log(doc); // Prints documents one at a time
            inovices.unshift(doc)
        }

        return inovices;
    }
    async updateInovice(inovice) {
        let ino = await new this.InoviceModel(inovice);
        await this.InoviceModel.updateOne({ _id: new mongoose.Types.ObjectId(inovice._id) }, inovice)
        return ino
    }

    async loadInovice(inoviceid) {
        let ino = await this.InoviceModel.findById(inoviceid);
        ino = Inovice.fromInoviceModel(ino);
        return ino;
    }
    /**
     * Coloca factura como pagada y transfiere los fondos
     * @param {string} inoviceid id de inovice
     * @returns {Promise<Inovice>}
     * @deprecated 
     */
    async setPayInovice(inoviceid) {
        console.log("DEBUG setpayinovice ", inoviceid)
        let id = mongoose.Types.ObjectId(inoviceid);

        await this.InoviceModel.updateOne({ _id: id }, { state: State.COMPLETED, aprobed_msg: "Deposito aprobado." });

        const inovice = await this.InoviceModel.findOne({ _id: id });
        const user = await Manager.UserManager.getInstance().getUserByID(inovice.cunstomer);
        let value = 0;
        if (inovice.method == PayMethods.MOVIL) {
            value = parseFloat(inovice.amountpaid) / parseFloat(inovice.pricethen)
        }

        if (inovice.method == PayMethods.CRYPTO) {
            value = Manager
                .BNBPriceManager
                .getInstance()
                .getPricePar("BNB") * parseFloat(inovice.amountpaid);
        }
        console.log("usd price", parseFloat(inovice.amountpaid), Manager.getBNBPriceProvider().getPricePar("USD"))
        console.log("DEBUG setPayInovice se recargara ", value)
        await Manager.BalanceManager.getInstance().transferTo(user, value);


        //enviar a usuario que se pago la factura
        this.notifyInovicePayToUser(user, inovice);
        return inovice;
    }
    /**
     * Marcar como pagada un inovice desde el evento de la blockchain
     * @param {string} inoviceid id de inovice
     * @param {string} amountpaid cantidad pagada
     * @param {string} from billetera proveniente el pago
     * @returns {Promise<Inovice>}
     */
    async setPayInoviceFromEvent(inoviceid, amountpaid, from) {
        if (!this.active) return;
        console.log("DEBUG setPayInoviceFromEvent ", inoviceid, amountpaid, from)
        let id = mongoose.Types.ObjectId(inoviceid);
        //console.log("ID", id)
        const price = Manager.BNBPriceManager.getInstance().getPrice();
        const value = price * parseFloat(amountpaid);
        var inovice = await this.InoviceModel.findOne({ _id: id });
        if (inovice.state == State.COMPLETED) return inovice
        inovice.state = State.COMPLETED;
        inovice.amountpaid = amountpaid;
        inovice.amountreceived = value;
        inovice.pricethen = price;
        await inovice.save();
        /*await this.InoviceModel.updateOne(
            { _id: id },
            { state: "COMPLETED", amountpaid, amountreceived: value, pricethen: price }
        );*/


        const user = await Manager.UserManager.getInstance().getUserByID(inovice.cunstomer);


        console.log("DEBUG setPayInoviceFromEvent se recargara " + value)
        console.log("DEBUG inovice ", inovice)
        await Manager.BalanceManager.getInstance().transferTo(user, value)

        //enviar a usuario que se pago la factura
        this.notifyInovicePayToUser(user, inovice);
        return inovice;
    }

    async setRefPayInovice(inoviceid, ref_pay) {
        console.log("DEBUG setRefPayInovice ", inoviceid, ref_pay);
        let id = mongoose.Types.ObjectId(inoviceid);
        //console.log("ID", id)
        /**
         * @type {Inovice}
         */
        var inovice = await this.InoviceModel.findOne({ _id: id });
        if (!inovice) throw new Exception("inovice_no_found", "no se encontro la factura correspondiente. Comuniquese con el administrador.")

        await this.InoviceModel.updateOne({ _id: id }, { ref_pay });


        inovice = Inovice.fromInoviceModel(inovice);
        inovice.ref_pay = ref_pay;
        console.log("setRefPayInovice", inovice, inovice.method == PayMethods.MOVIL)
        /**
         * if metodo de pago es pago movil
         *      notificar a observadores
         *     await this.notifyNewPayWithMovilMethod(user,inovice)
         */
        if (inovice.method == PayMethods.MOVIL) {

            console.log("DEBUG nuevo pago con metodo movil,avisar al admin")
            const user = await Manager.UserManager.getInstance().getUserByID(inovice.cunstomer);
            await this.notifyNewPayWithMovilMethod(user, inovice);
        }

        return inovice;
    }
    async setPendingInovice(inoviceid) {

        return null;
    }

    async cancelInovice(inoviceid) {
        console.log("DEBUG cancelInovice ", inoviceid)
        let id = mongoose.Types.ObjectId(inoviceid);
        await this.InoviceModel.updateOne({ _id: id }, { state: "CANCELED" });
        const inovice = Inovice.fromInoviceModel(await this.InoviceModel.findOne({ _id: id }));
        return inovice;
    }


    async declineInovice(inoviceid, reason) {
        console.log("DEBUG declineInovice ", inoviceid)
        let id = mongoose.Types.ObjectId(inoviceid);
        await this.InoviceModel.updateOne({ _id: id }, { state: State.DECLINED, aprobed_msg: reason });
        const inovice = Inovice.fromInoviceModel(await this.InoviceModel.findOne({ _id: id }));

        //enviar a usuario que se pago la factura
        const user = await Manager.UserManager.getInstance().getUserByID(inovice.cunstomer);
        this.notifyInovicePayToUser(user, inovice);
        return inovice;
    }


}
