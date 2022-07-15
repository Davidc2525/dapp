import User from "../UserProvider/User.js";
import Inovice from "./Inovice.js";

export class InoviceObservable {

    constructor() {

        /**
         * @type {InoviceOserver[]}
         */
        this.observers = [];
    }

    attach(observer) {
        this.observers.push(observer);
    }
    detach() {
        //TODO
    }

    /**
     * @param {User} user
     * @param {Inovice} inovice 
     */

    notifyInovicePayToUser(user, inovice) {
        for (let index = 0; index < this.observers.length; index++) {
            const observer = this.observers[index];
            try {
                observer.inovicePayToUser(user,inovice);
            } catch (error) {
                console.error("ERROR in observer", error)
            }

        }
    }

}

export class InoviceOserver {


    /**
     * @param {User} user
     * @param {Inovice} inovice 
     */
    inovicePayToUser(user,inovice) {
        console.log("WARN Observer no implemented newNotifyToUser")
    }

}