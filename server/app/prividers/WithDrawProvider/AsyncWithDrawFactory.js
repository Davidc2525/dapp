




import Inovice, { PayMethods } from "../InoviceProvider/Inovice.js";
import IAsyncWiathDrawProvider from "./IAsyncWiathDrawProvider.js";
import BNBAsyncWithDrawProvider from "./BNBAsyncWithDrawProvider.js";
import MovilAsyncWithDrawProvider from "./MovilAsyncWithDrawProvider.js";


export default class AsyncWithDrawFactory {

    bnbwithdraw = new BNBAsyncWithDrawProvider();
    movilwithdraw = new MovilAsyncWithDrawProvider();
    /**
     * 
     * @param {Inovice} inovice 
     * @returns {IAsyncWiathDrawProvider}
     */
    getProvider(inovice) {

        if (inovice.method == PayMethods.CRYPTO) {
            return this.bnbwithdraw
        }

        if (inovice.method == PayMethods.MOVIL) {
            return this.movilwithdraw
        }

    }

    attach(observer) {
        this.bnbwithdraw.attach(observer);
        this.movilwithdraw.attach(observer);
    }

}