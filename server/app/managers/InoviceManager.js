

import DefaultInoviceProvider from "../prividers/InoviceProvider/DefaultInoviceProvider.js"

/**
 * @type DefaultInoviceProvider
 */
let instance = null;
class InoviceManager {

    constructor() {
        instance = new DefaultInoviceProvider();

    }

    getInstance() { return instance }
}

export default new InoviceManager();