


import Bull from "bull"
import Manager from "../../managers/Manager.js";
import { InoviceOserver } from "../../prividers/InoviceProvider/InoviceObservable.js";
import User from "../../prividers/UserProvider/User.js";

/**
 * comunicarce con el servidor de administrador para 
 * procesar los pagos
 * 
 * los pagos manuales como el pago movil
 * se procesan manualmente
 */
export default class InoviceServiceProducer extends InoviceOserver {


    constructor() {
        super()
        this.name = "inovices";
        this.queue = new Bull(this.name);
        this.queue_response = new Bull(this.name + "_response");
        console.log("DEBUG InoviceServiceProducer: queue service: " + this.name);

        this.queue_response.process(this.process_responses.bind(this));

        Manager.getInoviceProvider().attach(this);
    }
    async process_responses(job, done) {
        console.log("pago procesado, enviar balance a usuario de inovice")
        console.log(job.data)
        if (job.data.pay_aprobed)
            await Manager.getInoviceProvider().setPayInovice(job.data.inoviceid);

        if (!job.data.pay_aprobed) { 
            await Manager.getInoviceProvider().declineInovice(job.data.inoviceid,job.data.msg);
        }
        done();
    }
    /**
     * Observador de inovice provider
     * cuando se genera una factura el cual el metodo de pago es pago movil
     * se recibe esta llamada a esta metodo
     * 
     * la responsabilidad de este metodo es notificar al servidor del administrador
     * por la cola espesifica
     * 
     *  queue = inovice
     * 
     * @param {User} user 
     * @param {*} inovice 
     */
    async newPayWithMovilMethod(user, inovice) {
        console.log("notificar al administrador")
        user.pass = null;
        try {
            await this.queue.add({
                event: "new_pay_with_movil_method",
                user,
                inovice
            })
        } catch (error) {
            console.log(error)
        }
    }



}
