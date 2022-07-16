

import App from "../prividers/App/App.js"

import FastifyApp from "../prividers/App/FastifyApp.js"
/**
 * @type App
 */
let instance = null;
class AppManager {

    constructor() {
        instance = new FastifyApp();

    }
    /**
     *  
     * @returns App
     */
    getInstance() { return instance }
}

export default new AppManager();