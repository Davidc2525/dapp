
const Bull = require("bull")
const Web3 = require("web3");
const Provider = require("@truffle/hdwallet-provider");

const ContratAbi = require("../../../build/contracts/Bet.json");
class BNBWithDrawService {
    contract_address = "0x95FCAb7D51d7f4cA1e39F5f01842cD44Aa840E6c";
    owner_address = "0xA400bAe4Ec88147de39172d7709B8334e4e60caA";
    privateKey = "690baf6fd1e001824d46e289a5230f2ba4136e839bc5001ceaab171f0a51454e";
    nodeUrl = "HTTP://127.0.0.1:8545";


    queue = new Bull("withdraw_bnb");
    queue_response = new Bull("withdraw_bnb_response");
    constructor() {

        this.queue.process(async (job, done) => {
            if (job.data.event == "withdraw") {
                try {
                    const data = await this.send_withdraw(
                        job.data.inovice.withdraw_details.crypto.address_withdraw,
                        job.data.inovice.amountreceived
                    )

                    this.queue_response.add({
                        event: "withdraw_send",
                        inoviceid: job.data.inovice._id,
                        hash: data.transactionHash
                    })
                    done()
                } catch (error) {
                    console.log(error)
                    this.queue_response.add({
                        event: "withdraw_error",
                        inoviceid: job.data.inovice._id,
                        error: error
                    })
                    done(error)
                }

            }


        })
    }
    async init() {

        const provider = new Provider(this.privateKey, this.nodeUrl);
        const web3 = new Web3(provider);
        const networkId = await web3.eth.net.getId();
        this.contract = new web3.eth.Contract(
            ContratAbi.abi,
            this.contract_address
        );

        return this;
    }

    async send_withdraw(to, amount_string) {
        console.log("send_withdraw,", to, amount_string)

        const data = await this.contract.methods.send_withdraw("0xabF2BC074dEE59b0249235F8e1bBD32a7A94d221", Web3.utils.toWei(amount_string, 'ether'))
            .send({ from: this.owner_address })
        console.log(data)
        return data;
    }
}

(function main() {
    new BNBWithDrawService().init()
        .then(async service => {

            console.log("BNBWithDrawService initiated")
            return

        })
        .catch(err => console.log("BNBWithDrawService error to initialize: ", err))
})()