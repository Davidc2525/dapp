import "dotenv/config";
import ICacheAndPusSubProvider from "./ICacheAndPusSubProvider.js";
import LRUCache from "./LRUCache.js";


class Exception {
    constructor(err, msg) {
        this.msg = msg;
        this.err = err;
    }
}
export default class DefaultCacheAndPubSubServiceProvider extends ICacheAndPusSubProvider {

    constructor() {
        super()
        console.log("DEBUG DefaultCacheAndPubSubServiceProvider");
        /**
         * @type {Map<string,LRUCache}
         */
        this.caches = new Map();
        //this.cache = new LRUCache(process.env.CACHE_CAPACITY || 10);

        
         

    }
    
    //privates 
    async _createCache(name, capacity) {
        if (this.caches.has(name)) {
            return this.caches.get(name)
            throw new Exception("duplicated_cache", "el cache ya existe");
        } else {
            this.caches.set(name, new LRUCache(capacity));
            return this.caches.get(name);
        }
    }
    //privates
    //cache
    async createCache(name, capacity = process.env.CACHE_CAPACITY || 100) {
        return this._createCache(name, capacity)
    }
    async getCache(name, capacity = process.env.CACHE_CAPACITY || 100) {
        return this.createCache(name, capacity)
    }
    //cache


    //pubsub
    /**
   * This callback type is called `EventMessage` and is displayed as a global symbol.
   *
   * @callback EventMessage
   * @param {string} message
   * @param {string} channel
   *  
   */

    /**
     * Does something asynchronously and executes the callback on completion.
     * @param {string} channel
     * @param {EventMessage} listener - The listener that handles the response.
     * @returns {Primise<string>} channel
     */
    async subscribe(channel, listener) { console.log("WARN  subscribe no soported in default provider"); }
    async unsubscribe(channel) { console.log("WARN  unsubscribe no soported in default provider"); }


    async publish(channel, payload) { console.log("WARN  publish no soported in default provider"); }
    //pubsub
}