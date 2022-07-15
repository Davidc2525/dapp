import User from "../UserProvider/User.js";
import { ConnectionsUser } from "./DefaultRealTimeProvider.js";
export class RealTimeObservable {

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
     * 
     * @param {ConnectionsUser} conn_user
     * 
     */

    notifyNewConnToUser(conn_user) {
        for (let index = 0; index < this.observers.length; index++) {
            const observer = this.observers[index];
            try {
                observer.newConnUser(conn_user);
            } catch (error) {
                console.error("ERROR in observer", error)
            }

        }
    }

}

export class RealTimeOserver {


    /**
     * @param {ConnectionsUser} conn_user
     * 
     */
    newConnUser(conn_user) {
        console.log("WARN Observer no implemented newNotifyToUser")
    }

}