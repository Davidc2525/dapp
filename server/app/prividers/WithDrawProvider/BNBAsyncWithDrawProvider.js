import IAsyncWiathDrawProvider from "./IAsyncWiathDrawProvider.js";

class Exception {
    constructor(err, msg) {
        this.msg = msg;
        this.err = err;

    }
}
/**
 * @implements {IAsyncWiathDrawProvider}
 */
export default class BNBAsyncWithDrawProvider extends IAsyncWiathDrawProvider {

    constructor() {
        super();

        console.log("DEBUG BNBAsyncWithDrawProvider");
    }

    /**
     * 
     * @param {User} user
     * @param {Inovice} inovice 
     * @returns {Inovice}
     */
    withdraw(user, inovice) {

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
    withdrawalProcessed(inoviceid) { }


    /**
     * se llama cuando el servicio rechaza la retirada de credito
     * @param {string} inoviceid
     * @param {string} reason razon por la cual ser rechazo el retiro
     */
    withdrawalDeclined(inoviceid, reason) { }

    /**
     * se llama cuando en el servicio de retiro se produce un error
     * al momento de enviar los fondos
     * @param {string} inoviceid
     * @param {string} err nombre del error
     * @param {string} msg descripcion del error
     */
    withdrawalError(inoviceid, err, msg) { }


}
