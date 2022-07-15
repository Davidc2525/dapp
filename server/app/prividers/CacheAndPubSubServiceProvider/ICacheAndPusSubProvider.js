import "dotenv/config"
import Cache from "./Cache.js";
import { SlotGameOserver } from "../SlotGameProvider/SlotGameObservable.js";
/**
 * Interface de proveedir de cache y pub sub 
 */
export default class ICacheAndPusSubProvider  extends SlotGameOserver{

    constructor() {
        super();
     }

    //cache
    /**
     * 
     * @param {string} name 
     * @param {number} capacity 
     * @returns {Promise<Cache>}
     */
    async createCache(name, capacity = process.env.CACHE_CAPACITY || 100) { console.log("WARN createCache no implemented"); }
    /**
     * 
     * @param {string} name 
     * @param {number} capacity 
     * @returns {Promise<Cache>}
     */
    async getCache(name, capacity = process.env.CACHE_CAPACITY || 100) { console.log("WARN getCache no implemented"); }
    //cache


    //pubsub
    /**
   * 
   *
   * @callback EventMessage
   * @param {string} message
   * @param {string} channel
   *  
   */

    /**
     * 
     * @param {string} channel
     * @param {EventMessage} listener - The listener that handles the response.
     * @returns {Primise<string>} channel
     */
    async subscribe(channel, listener) { console.log("WARN  subscribe no implemented"); }
    async unsubscribe(channel) { console.log("WARN  unsubscribe no implemented"); }


    async publish(channel, payload) { console.log("WARN  publish no implemented"); }
    //pubsub
}