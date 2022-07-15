
import "dotenv/config";
import ICacheAndPusSubProvider from "../prividers/CacheAndPubSubServiceProvider/ICacheAndPusSubProvider.js"
import DefaultCacheAndPubSubServiceProvider from "../prividers/CacheAndPubSubServiceProvider/DefaultCacheAndPubSubServiceProvider.js"
import RedisCacheAndPubSubServiceProvider from "../prividers/CacheAndPubSubServiceProvider/RedisCacheAndPubSubServiceProvider.js"


/**
 * @type ICacheAndPusSubProvider
 */
let instance = null;
class CacheManager {

    constructor() {
        console.log("DEBUG provider: "+process.env.CACHE_PROVIDER)
        if (process.env.CACHE_PROVIDER == "default") {
            instance = new DefaultCacheAndPubSubServiceProvider();

        } else if (process.env.CACHE_PROVIDER == "redis") {
            instance = new RedisCacheAndPubSubServiceProvider();

        }

    }

    getInstance() { return instance }
}

export default new CacheManager();