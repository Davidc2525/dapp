

import DefaultRealTimeProvider from "../prividers/RealTimeProvider/DefaultRealTimeProvider.js"

/**
 * @type DefaultRealTimeProvider
 */
let instance = null;
class RealTimeManager {

    constructor() {
        instance = new DefaultRealTimeProvider();

    }
     /**
     *  
     * @returns DefaultRealTimeProvider
     */
    getInstance() { return instance }
}

export default new RealTimeManager(); 
