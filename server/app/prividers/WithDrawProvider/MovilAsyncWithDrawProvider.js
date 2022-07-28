import IAsyncWiathDrawProvider from "./IAsyncWiathDrawProvider.js";
import Bull from "bull";
import Manager from "../../managers/Manager.js";
import Inovice, { State } from "../InoviceProvider/Inovice.js";

class Exception {
    constructor(err, msg) {
        this.msg = msg;
        this.err = err;

    }
}
/**
 * @implements {IAsyncWiathDrawProvider}
 * 
 */
export default class MovilAsyncWithDrawProvider extends IAsyncWiathDrawProvider {

    constructor() {
        super();
        console.log("DEBUG MovilAsyncWithDrawProvider");

        this.queue = new Bull("withdraw_movil");
        this.queue_response = new Bull("withdraw_movil_response");

        this.queue_response.process((job, done) => {

        })
    }


    /**
     * 
     * @param {User} user
     * @param {Inovice} inovice 
     * @returns {Inovice}
     */
    async withdraw(user, inovice) {
        console.log("DEBUG MOVIL WITHDRAW: ", user, inovice);
        await Manager.getBalanceProvider().transferFrom(user, parseFloat(inovice.amountpaid))

        inovice = await this.withdrawalProcessed(inovice._id)
        return inovice
    }

    /**
     * Es invocado luego de que el retiro fue
     * procesado por el servicio correspondiente
     *
     * se encarga de actializar los balances del usuario
     * luego de su procesado (de haber enviado los fondos)
     *
     * el servicio solo se encarga de enviar los fondos al usuario
     * luego este metodo se encarga de actualizar los balances
     *
     * @param {string} inoviceid
     */
    async withdrawalProcessed(inoviceid) {
        console.log("DEBUG MOVIL withdrawalProcessed: ", inoviceid);
        /**
         * @type {Inovice}
         */
        let ino = await Manager.getInoviceProvider().loadInovice(inoviceid);
        console.log(ino)
        let user = await Manager.getUserProvider().getUserByID(ino.cunstomer);

        ino.state = State.COMPLETED;
        ino.aprobed_msg = "Retiro exitoso";

        //await Manager.getBalanceProvider().transferTo(user, parseFloat(ino.amountpaid))

        await Manager.getInoviceProvider().updateInovice(ino)

        this.nofifyProcessedInovice(user, ino);
        return ino;
    }


    /**
     * se llama cuando el servicio rechaza la retirada de credito
     * @param {string} inoviceid
     * @param {string} reason razon por la cual ser rechazo el retiro
     */
    async withdrawalDeclined(inoviceid, reason) {
        console.log("DEBUG MOVIL withdrawalDeclined: ", inoviceid, reason);
        /**
         * @type {Inovice}
         */
        let ino = await Manager.getInoviceProvider().loadInovice(inoviceid);
        console.log(ino)
        let user = await Manager.getUserProvider().getUserByID(ino.cunstomer);

        ino.state = State.DECLINED;
        ino.aprobed_msg = reason;

        await Manager.getBalanceProvider().transferTo(user, parseFloat(ino.amountpaid))

        await Manager.getInoviceProvider().updateInovice(ino)
        this.nofifyDeclinedInovice(user, ino);
        return ino
    }

    /**
     * se llama cuando en el servicio de retiro se produce un error
     * al momento de enviar los fondos
     * @param {string} inoviceid
     * @param {string} err nombre del error
     * @param {string} msg descripcion del error
     */
    async withdrawalError(inoviceid, err, msg) {
        return await this.withdrawalDeclined(inoviceid, err + ":" + msg);
    }

}
