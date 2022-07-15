


/**
 * interface cache
 * @type {<K,V>}
 */
export default class Cache {
    /**
     * 
     * @param {K} key 
     * @type {V}
     */
    async get(key) { }
    /**
     * 
     * @param {K} key 
     * @param {V} value 
     * @type {K}
     */
    async put(key, value) { }

    /**
     * @callback Serialize
     * @param {Object} data 
     */
    /**
     * 
     * @param {Serialize} serialize 
     */
    setSerialize(serialize) { }
    /**
    * @callback Deserialize
    * @param {Object} data 
    */
    /**
     * 
     * @param {Deserialize} deserealize 
     */
    setDeserialize(deserealize) { }
}