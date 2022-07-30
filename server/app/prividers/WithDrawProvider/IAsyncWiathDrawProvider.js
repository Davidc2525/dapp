


import Inovice from "../InoviceProvider/Inovice.js";

class AsyncWithDrawObservable {
    constructor() {

        /**
         * @type {AsyncWithDrawObserver[]}
         */
        this.observers = [];
    }

    attach(observer) {
        this.observers.push(observer);
    }
    detach() {
        //TODO
    }

    nofifyProcessedInovice(user,inovice) {
        for (let index = 0; index < this.observers.length; index++) {
            const observer = this.observers[index];
            try {
                observer.nofifyProcessedInovice(user, inovice);
            } catch (error) {
                console.error("ERROR in observer", error)
            }

        }
    }

    nofifyDeclinedInovice(user,inovice) {
        for (let index = 0; index < this.observers.length; index++) {
            const observer = this.observers[index];
            try {
                observer.nofifyDeclinedInovice(user, inovice);
            } catch (error) {
                console.error("ERROR in observer", error)
            }

        }
    }
}
class AsyncWithDrawObserver {
    nofifyProcessedInovice(user,inovice) {

    }
    nofifyDeclinedInovice(user,inovice) {

    }
}
/**
 * interfas de metodos de retiro de credito asincronos (basado en servicios)
 * @interface IAsyncWiathDrawProvider
 */
export default class IAsyncWiathDrawProvider extends AsyncWithDrawObservable {

    /**
     * 
     * @param {User} user
     * @param {Inovice} inovice 
     * @returns {Inovice}
     */
    async withdraw(user, inovice) { }

    //cancelWithdraw(user, inovice) { }

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
     * @param {any} payload objeto para pasar cualquier otro dato
     */
    async withdrawalProcessed(inoviceid,payload) { }


    /**
     * se llama cuando el servicio rechaza la retirada de credito
     * @param {string} inoviceid 
     * @param {string} reason razon por la cual ser rechazo el retiro
     * @param {any} payload objeto para pasar cualquier otro dato
     */
    async withdrawalDeclined(inoviceid, reason,payload) { }

    /**
     * se llama cuando en el servicio de retiro se produce un error
     * al momento de enviar los fondos
     * @param {string} inoviceid 
     * @param {string} err nombre del error
     * @param {string} msg descripcion del error
     * @param {any} payload objeto para pasar cualquier otro dato
     */
    async withdrawalError(inoviceid, err, msg,payload) { }

}



