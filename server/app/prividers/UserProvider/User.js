
import Manager from "../../managers/Manager.js";
import { Payload } from "../RealTimeProvider/Payload.js";
/**
 * Clase para enviar mensajes a traves de el proveedor RealTime
 */
export class NotifiedUser {
   
    
    /**
     * enviar notificacion a usuario
     * @param {string} event_name 
     * @param {Payload} payload 
     * @returns {NotifiedUser}
     */
    send(payload) {
        Manager.getRealTimeProvider().emitToUser(this, payload);
        return this;
    }

}

/**
 * clase User, datos de usuario
 */
export default class User extends NotifiedUser{
    
    constructor({id=null,username=null,active=false,email=null,pass=null,wallet_address=null,wallet_address_is_set=null}={}) {
        super();
        //this._id;
        /**
         * id de usuario
         * @type {string}
         */
        this.id = id;
        /**
         * username de usuario
         * @type {string}
         */
         this.username = username;
        /**
         * correo de usuario
         * @type {string}
         */
        this.email = email;
        /**
         * clave de usuario
         * @type {string}
         */
        this.pass = pass;
        /**
         * @type {boolean}
         */
        this.active = active;
        /**
         * billetera de usuario
         * @type {string}
         */
        this.wallet_address = wallet_address;
        /**
         * muestra si el usuario ya añadio billetera
         * @type {Boolean}
         */
        this.wallet_address_is_set = wallet_address_is_set;
    }
}

