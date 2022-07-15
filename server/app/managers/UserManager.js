import "dotenv/config";


import IUserProvider from "../prividers/UserProvider/IUserProvider.js"
import DefaultUserProvider from "../prividers/UserProvider/DefaultUserProvider.js"
import CacheableUserProviderDecorator from "../prividers/UserProvider/CacheableUserProviderDecorator.js"
/**
 * @interface DefaultUserProvider
 * @type DefaultUserProvider
 */
let instance = null; 

class UserManager {

    constructor() {
        
        instance = new CacheableUserProviderDecorator(new DefaultUserProvider());
        
    }   

    getInstance() { return instance }
}
export default new UserManager();