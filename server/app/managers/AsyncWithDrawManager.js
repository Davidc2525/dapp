import AsyncWithDrawFactory from "../prividers/WithDrawProvider/AsyncWithDrawFactory.js";



/**
 * @type AsyncWithDrawFactory
 */
let instance = null;
class AsyncWithDrawManager {

    constructor() {
        instance = new AsyncWithDrawFactory();

    }
    /**
     *  
     * @returns App
     */
    getInstance() { return instance }
}

export default new AsyncWithDrawManager();