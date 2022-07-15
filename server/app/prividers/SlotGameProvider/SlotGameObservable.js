import { InoviceOserver } from "../InoviceProvider/InoviceObservable.js";
import { SlotGame } from "./SlotGame.js";

export class SlotGameObservable{

    constructor(){

        /**
         * @type {SlotGameOserver[]}
         */
        this.observers = [];
    }
    
    attach(observer){
        this.observers.push(observer);
    }
    detach(){
        //TODO
    }

    /**
     * 
     * @param {SlotGame} bet 
     */
    notifyWinAll(bet){
        for (let index = 0; index < this.observers.length; index++) {
            const observer = this.observers[index];
            try {
                observer.newWinAll(bet);
            } catch (error) {
                console.error("ERROR in observer", error)
            }
            
        }
    } 

    notifyToUser(bet){
        for (let index = 0; index < this.observers.length; index++) {
            const observer = this.observers[index];
            try {
                observer.newNotifyToUser(bet);
            } catch (error) {
                console.error("ERROR in observer", error)
            }
            
        }
    }

}

export class SlotGameOserver extends InoviceOserver{

    /**
     * 
     * @param {SlotGame} bet 
     */
    newWinAll(bet){
        console.log("WARN Observer no implemented newWinAll")
    }

    newNotifyToUser(bet){
        console.log("WARN Observer no implemented newNotifyToUser")
    }

}