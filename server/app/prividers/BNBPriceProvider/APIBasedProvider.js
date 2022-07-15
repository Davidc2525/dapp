import 'dotenv/config';

import fetch from "node-fetch";
export default class APIBasedProvider {
    constructor() {
        console.log("DEBUG BNBPriceProvider:APIBasedProvider");
        console.log("DEBUG  -bnb price host:"+process.env.SERVICE_BNB_PRICE_HOST)
        console.log("DEBUG  -bnb price port:"+process.env.SERVICE_BNB_PRICE_PORT)
        this.price = 0;
        this.interval = 0;

        this._getBnbPrice()
        this.createInterval();


    }
    /**
     * 
     * @returns precio actual del bnb
     */
    getPrice(){
        return this.price;
    }

    createInterval() {
        this.interval = setInterval(this._getBnbPrice.bind(this), 10000);
    }
    clearInterval() {
        clearInterval(this.interval)
        this.interval = 0;
    }

    _getBnbPrice() {
        let url = process.env.SERVICE_BNB_PRICE_PROTO+process.env.SERVICE_BNB_PRICE_HOST+":"+process.env.SERVICE_BNB_PRICE_PORT;
        
        

        fetch(url+"/bnbprice/server-api-based-provider")
            .then(x => x.json())
            .then(data => {
                //console.log(data)
                console.log("DEBUG BNBPRICE: " + data.actual_price)
                if (data.actual_price != 0) this.price = (data.actual_price);
            })
            .catch((error) => {
                console.log("ERROR _getBnbPrice ", error)
            })
    }
}