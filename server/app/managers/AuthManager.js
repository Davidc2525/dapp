

import DefaultAuthProvider from "../prividers/AuthProvider/DefaultAuthProvider.js"

/**
 * @type DefaultAuthProvider
 */
let instance = null;
class AuthManager {

    constructor() {
        instance = new DefaultAuthProvider();

    }

    getInstance() { return instance }
}

export default new AuthManager();