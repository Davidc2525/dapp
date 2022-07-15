

import DefaultBalanceProvider from "../prividers/BalanceProvider/DefaultBalanceProvider.js"

/**
 * @type DefaultBalanceProvider
 */
let instance = null;
class BalanceManager {

    constructor() {
        instance = new DefaultBalanceProvider();

    }
    /**
     * 
     * @returns DefaultBalanceProvider
     */
    getInstance() { return instance }
}

export default new BalanceManager();