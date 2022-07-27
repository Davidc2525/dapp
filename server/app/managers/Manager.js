
import UserManager from "./UserManager.js";
import BalanceManager from "./BalanceManager.js"
import CountBetManager from "./CountBetManager.js"
import SlotGameManager from "./SlotGameManager.js";
import DBManager from "./DBManager.js";
import AuthManager from "./AuthManager.js";
import PayBcManager from "./PayBcManager.js";
import InoviceManager from "./InoviceManager.js"
import RealTimeManager from "./RealTimeManager.js";
import BNBPriceManager from "./BNBPriceManager.js";
import AppManager from "./AppManager.js";
import CacheAndPubSubManager from "./CacheAndPubSubManager.js";
import EmailServiceProducerManager from "./EmailServiceProducerManager.js";

export default {
    AppManager,
    RealTimeManager,
    BNBPriceManager,
    InoviceManager,
    PayBcManager,
    UserManager,
    BalanceManager,
    CountBetManager,
    SlotGameManager,
    AuthManager,
    CacheAndPubSubManager,
    EmailServiceProducerManager,

    //nueva version de obtener los providers
    getAppProvider() { return AppManager.getInstance() },
    getRealTimeProvider() { return RealTimeManager.getInstance() },
    getBNBPriceProvider() { return BNBPriceManager.getInstance() },
    getInoviceProvider() { return InoviceManager.getInstance() },
    getPayBcProvider() { return PayBcManager.getInstance() },
    getUserProvider() { return UserManager.getInstance() },
    getBalanceProvider() { return BalanceManager.getInstance() },
    getCountBetProvider() { return CountBetManager.getInstance() },
    getSlotGameProvider() { return SlotGameManager.getInstance() },
    getAuthProvider() { return AuthManager.getInstance() },
    getCacheAndPubServiceProvider() { return CacheAndPubSubManager.getInstance() },
    getEmailServiceProducerService() { return EmailServiceProducerManager.getInstance() }
}