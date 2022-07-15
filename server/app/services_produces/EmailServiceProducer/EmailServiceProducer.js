


import Bull from "bull"
import Manager from "../../managers/Manager.js";
import User from "../../prividers/UserProvider/User.js";


export default class EmailServiceProducer{


    constructor(){
        this.name = "email";
        this.queue = new Bull(this.name); 
        console.log("DEBUG EmailServiceProducer: queue service: "+this.name);

    }

    /**
     * 
     * @param {User} user 
     */
    async sendActiveAccount(user){
        user.pass = null;
        try {
            await this.queue.add({
                event:"active_account",
                user
            })
        } catch (error) {
            console.log(error)
        }
    }

    async sendForgotPassworrd(user,new_temp_pass) {
        user.pass = null;
        try {
           
            await this.queue.add({
                event:"forgot_pass",
                user,
                new_temp_pass
            })
        } catch (error) {
            console.log(error)
        }
    }


}
