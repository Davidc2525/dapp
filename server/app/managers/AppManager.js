

import App from "../prividers/App/App.js"


/**
 * @type App
 */
let instance = null;
class AppManager {

    constructor() {
        instance = new App();

    }
    /**
     *  
     * @returns App
     */
    getInstance() { return instance }
}

export default new AppManager();