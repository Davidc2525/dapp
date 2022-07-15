import DefaulPayServiceProvider from "../prividers/BlockChain/PayServiceProvider/DefaultPayServiceProvider.js"

/**
 * @interface DefaulPayServiceProvider
 * @type DefaulPayServiceProvider
 */
let instance = null; 

class PayBcManager {

    constructor() {
        
        instance = new DefaulPayServiceProvider();
        
    }

    getInstance() { return instance }
}

export default new PayBcManager();