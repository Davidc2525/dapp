import EmailServiceProducer from "../services_produces/EmailServiceProducer/EmailServiceProducer.js"

/**
 * @type EmailServiceProducer
 */
let instance = null;
class EmailServiceProducerManager {

    constructor() {
        instance = new EmailServiceProducer();

    }
    /**
     *  
     * @returns EmailServiceProducer
     */
    getInstance() { return instance }
}

export default new EmailServiceProducerManager();