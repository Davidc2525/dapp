

import IUserProvider from "./IUserProvider.js"
import User from "./User.js";
import DefaultUserProvider from "./DefaultUserProvider.js";
import Manager from "../../managers/Manager.js";
import Cache from "../CacheAndPubSubServiceProvider/Cache.js";

class Exception {
    constructor(msg) {
        this.msg = msg;

    }
}
class UserNoFoundException extends Exception {
    constructor(msg) {
        super(msg);
        this.err = "UserNoFound";
    }
}

class CacheableUserProviderDecorator {
    /**
     * @param {DefaultUserProvider} provider
     */
    constructor(provider) {

        console.log("DEBUG CacheableUserProviderDecorator")
        this.provider = provider;

        /**
        * @type {Cache<string,User>}
        */
        //this.cache_id = Manager.getCacheAndPubServiceProvider().createCache("user_provider_id");
        //this.cache_email = Manager.getCacheAndPubServiceProvider().createCache("user_provider_email");
    }

    /**
    * @returns User
    */
    async getUserByID(uid) {
        const cache = await Manager.getCacheAndPubServiceProvider().createCache("user_provider_id");
        cache.setSerialize(JSON.stringify)
        cache.setDeserialize(raw => {
            //console.log("           deserialize: ", raw)
            return new User(JSON.parse(raw))
        })
        /**
         * @type {User}
         */
        let user = await cache.get(uid);

        if (user != null) {//existe en cache
            //console.log("DEBUG      - return user from cache",uid,user)

        } else {//no existe en cache
            user = await this.provider.getUserByID(uid);
            //console.log("DEBUG  -ADD TO CACHE",user)

            await cache.put(uid, user);
        }
        return (user);
    }

    /**
    * @type User
    */
    async getUserByEmail(email) {

        return this.provider.getUserByEmail(email)
    }
     /**
    * @type User
    */ 
      async getUserByUsername(username) {return this.provider.getUserByUsername(username)}
    /**
     * 
     * @param {User} user 
     * @returns User
     */
    async createUser(user) {

        return this.provider.createUser(user)
    }

    async setWalletAddress(user, address) {
        await this.provider.setWalletAddress(user, address);
        const cache = await Manager.getCacheAndPubServiceProvider().createCache("user_provider_id");
        
        await cache.put(user.id,await this.provider.getUserByID(user.id));
    }




}

export default CacheableUserProviderDecorator;