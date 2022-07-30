
const Web3 = require("web3");
//provider = require("@truffle/contrat")
const Provider = require("@truffle/hdwallet-provider");


const MyContrat = require("../build/contracts/Bet.json");

const address = "0x83180f85bD8E5cc1244EAF4222c1a6839F1E8d3e";
const privateKey = "c989717449d2da44ca9ccc5eeffb9289c4c8423d1899bf3a6f006abd0bdbcb16";


const to_address = "0xabF2BC074dEE59b0249235F8e1bBD32a7A94d221";
const nodeUrl = "HTTP://127.0.0.1:8545";

async function event() {
    var ether_port = 'ws://localhost:8545'
    var web3 = new Web3(new Web3.providers.WebsocketProvider(ether_port));

    const networkId = await web3.eth.net.getId();
    const myContrat = new web3.eth.Contract(
        MyContrat.abi,
        MyContrat.networks[networkId].address
    );
    let evento = myContrat.events.userTrnasferAmount();
    evento.on('data', event => {
        //console.log(event.returnValues)
        console.log("cantidad enviada: " + Web3.utils.fromWei(event.returnValues.amount) + " BNB");
        console.log("direccion de usuario: " + event.returnValues.from)
        console.log("id de factura: " + event.returnValues.adviceId)
    })
}

const init1 = async () => {
    try {
        const provider = new Provider(privateKey, nodeUrl);
        const web3 = new Web3(provider);
        const networkId = await web3.eth.net.getId();
        const myContrat = new web3.eth.Contract(
            MyContrat.abi,
            "0x191524a58F200dEe4D13a5e511b398b2BF23f9D1"
        );

        const data = await myContrat.methods.send_withdraw(
            "0xabF2BC074dEE59b0249235F8e1bBD32a7A94d221", Web3.utils.toWei('0.5', 'ether'))
            .send({ from: "0x8b9680B7bFd1FFdea428377A9E952F9Ad3939C62" })

        console.log(data)
    } catch (err) { console.log("error",err) }




}

const init2 = async () => {
    try {
        const provider = new Provider(privateKey, nodeUrl);
        const web3 = new Web3(nodeUrl);
        const networkId = await web3.eth.net.getId();
        const myContrat = new web3.eth.Contract(
            MyContrat.abi,
           "0x8e0Fc5D403125CDE8C9472B6C02d3b19A552CD1D"
        );


        const tx = await myContrat.methods.sendMoneyToWinnerInWei(to_address, Web3.utils.toWei('0.5', 'ether'));
        const gas = await tx.estimateGas({ from: address });
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const nonce = await web3.eth.getTransactionCount(address);

        console.log("signTransaction " + myContrat.options.address)
        console.log("gas price " + gas)
        const signedTx = await web3.eth.accounts.signTransaction({
            to: myContrat.options.address,
            data,
            gas,
            gasPrice,
            nonce,
            chainId: networkId
        }, privateKey)
        console.log(signedTx)

        console.log("signTransaction yet")
    } catch (error) {
        console.log(error)
    }



}


async function main() {
    try {
        await init1();

    } catch (error) {
        console.log(error)
    }
}

try {
    main().catch(e => console.log(e))
} catch (error) {

}