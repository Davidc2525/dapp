
const Bull = require("bull")
const Web3 = require("web3");
const Provider = require("@truffle/hdwallet-provider");

const ContratAbi = require("../../../build/contracts/Bet.json");
class BNBWithDrawService {
    contract_address = "0x18dB58CCb751036C09763aC0083cE35AE2eCAd98";
    owner_address = "0x981fA851204B57E46B4fA882612f653FB5a8B6fE";
    privateKey = "2d705ca7b0f166bbeb92b6e59cf451feded1601abf09e195d4fdde0868e0a3b8";
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

                    await this.queue_response.add({
                        event: "withdraw_send",
                        inoviceid: job.data.inovice._id,
                        hash: data.transactionHash
                    })
                    done()
                } catch (error) {
                    console.log(error)
                    await this.queue_response.add({
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

        /**
         * const provider = new Provider(this.privateKey, this.nodeUrl);
        const web3 = new Web3(provider);
        const networkId = await web3.eth.net.getId();
        this.contract = new web3.eth.Contract(
            ContratAbi.abi,
            this.contract_address
        );
         */

        return this;
    }
    /**
     * test
     * @param {*} to 
     * @param {*} amount_string 
     * @returns 
     */
    async send_withdraw(to, amount_string) {
        console.log("send_withdraw,", to, amount_string)


        const provider = new Provider(this.privateKey, this.nodeUrl);
        const web3 = new Web3(provider);
        const networkId = await web3.eth.net.getId();
        this.contract = new web3.eth.Contract(
            ContratAbi.abi,
            this.contract_address
        );

        const data = await this.contract.methods.send_withdraw(to, Web3.utils.toWei(amount_string, 'ether'))
            .send({ from: this.owner_address })
        console.log(data)

        provider.engine.stop();
        return data;
    }

    /**
     * no usar
     * @param {*} to 
     * @param {*} amount_string 
     * @returns 
     */
    async send_withdraw_2(to, amount_string) {
        console.log("send_withdraw_2,", to, amount_string)

        //const provider = new Provider(this.privateKey, this.nodeUrl);
        const web3 = new Web3(this.nodeUrl);
        const networkId = await web3.eth.net.getId();
        const myContrat = new web3.eth.Contract(
            ContratAbi.abi,
            this.contract_address
        );


        const tx = await this.contract.methods.send_withdraw(to, Web3.utils.toWei(amount_string, 'ether'));
        const gas = await tx.estimateGas({ from: this.owner_address });
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const nonce = await web3.eth.getTransactionCount(this.owner_address);

        console.log("signTransaction " + this.owner_address)
        console.log("gas price " + gas)
        const signedTx = await web3.eth.accounts.signTransaction({
            to:this.owner_address,
            data,
            gas,
            gasPrice,
            nonce,
            chainId: networkId
        }, this.privateKey)
        console.log(signedTx)
        return signedTx;
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