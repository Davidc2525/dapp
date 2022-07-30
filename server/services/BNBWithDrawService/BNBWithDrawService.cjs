
const Bull = require("bull")
const Web3 = require("web3");
const Provider = require("@truffle/hdwallet-provider");

const ContratAbi = require("../../../build/contracts/Bet.json");
class BNBWithDrawService {
    contract_address = "0xf85343EBE58D5B9493E63e166B77377C6a8fB3ac";
    owner_address = "0xcF8D8BAbeF050391766a7c88e8d70cA7F27c4775";
    privateKey = "1cac6d8e8a20e3e6b6488a36353d15f8d185077981f1d857f09891a7492f9100";
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