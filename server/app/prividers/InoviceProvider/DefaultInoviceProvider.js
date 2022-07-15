
import Manager from "../../managers/Manager.js";
import Inovice from "./Inovice.js";

import mongoose from 'mongoose';
import { InoviceObservable } from "./InoviceObservable.js";
import "dotenv/config";


export default class DefaultInoviceProvider extends InoviceObservable {

    constructor() {
        super()
        console.log("DEBUG DefaultInoviceProvider")

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
        ino = Inovice.fromInoviceModel(await ino.save());

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

        await this.InoviceModel.updateOne({ _id: id }, { state: "COMPLETED" });

        const inovice = await this.InoviceModel.findOne({ _id: id });
        const user = await Manager.UserManager.getInstance().getUserByID(inovice.cunstomer);
        const value = Manager.BNBPriceManager.getInstance().price * parseFloat(inovice.amountpaid);

        console.log("DEBUG setPayInovice se recargara " + value)
        await Manager.BalanceManager.getInstance().transferTo(user, value)
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
        if (inovice.state == "COMPLETED") return inovice
        inovice.state = "COMPLETED";
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



}