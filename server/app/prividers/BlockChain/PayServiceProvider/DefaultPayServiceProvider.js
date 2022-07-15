
import Web3 from "web3"
import cjson from "cjson"
import path from "path"
import Manager from "../../../managers/Manager.js";
import "dotenv/config"
//console.log( path.resolve('build/contracts/Bingo.json'))
//import MyContrat from "../../../../../build/contracts/Bingo.json" assert {type: 'json'};
const MyContrat = cjson.load(path.resolve('build/contracts/Bet2.json'));
var options = {
    timeout: 30000, // ms

    // Useful for credentialed urls, e.g: ws://username:password@localhost:8546
    headers: {
        // authorization: 'Basic username:password'
    },

    clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: 60000 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5000,
        onTimeout: false
    }
};

class Exception {
    constructor(err, msg) {
        this.msg = msg;
        this.err = err;
    }
}
export default class DefaulPayServiceProvider {
    constructor() {
        console.log("DEBUG DefaulPayServiceProvider")
        this._subscribeToPayReceiver()
    }

    async sendPay() {
        //TODO
    }

    async _subscribeToPayReceiver() {
        console.log("DEBUG -subscribeToPayReceiver")
        //wss://dex.binance.org/api/ws
        //wss://testnet.binance.vision/ws
        //wss://testnet-dataseed.binance.org/
        var ether_port = process.env.BC_URl_WEBSOCKET;
        //var ether_port = "wss://testnet.binance.vision/ws";
        var web3 = new Web3(new Web3.providers.WebsocketProvider(ether_port, options));

        const networkId = await web3.eth.net.getId();
        const myContrat = new web3.eth.Contract(
            MyContrat.abi,
            MyContrat.networks[networkId].address
        );
        let evento = myContrat.events.userRecharge();
        evento.on('data', event => {
            console.log(event)
            console.log("cantidad enviada: " + Web3.utils.fromWei(event.returnValues.amount) + " BNB");
            console.log("cantidad enviada wei: " + event.returnValues.amount + " weis bnb");
            console.log("direccion de usuario: " + event.returnValues.from)
            console.log("id de factura: " + event.returnValues.inoviceid)

            Manager.InoviceManager
                .getInstance()
                .setPayInoviceFromEvent(
                    event.returnValues.inoviceid,
                    Web3.utils.fromWei(event.returnValues.amount),
                    event.returnValues.from
                )
        })
    }

}