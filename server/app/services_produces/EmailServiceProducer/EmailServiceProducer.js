


import Bull from "bull"
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

}
