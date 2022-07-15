

import APIBasedProvider from "../prividers/BNBPriceProvider/APIBasedProvider.js"


/**
 * @type APIBasedProvider
 */
let instance = null;
class BNBPriceManager {

    constructor() {
        instance = new APIBasedProvider();

    }

    getInstance() { return instance }
}

export default new BNBPriceManager();