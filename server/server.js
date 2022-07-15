
const Web3 = require("web3");
//provider = require("@truffle/contrat")
const Provider = require("@truffle/hdwallet-provider");


const MyContrat = require("../build/contracts/Bingo.json");

const address = "0x6F7200d0332132eD79a4f3b34324f1407c40657f";
const privateKey = "d0badd9538a726a0e998f6e61ff665bba3d6e27642265f841f990c12c2b2803d";


const to_address = "0x820ec55ea774F8A8946F1746AbfF3Ec21736a451";
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
    evento.on('data', event =>{
         //console.log(event.returnValues)
        console.log("cantidad enviada: "+Web3.utils.fromWei(event.returnValues.amount)+" BNB");
        console.log("direccion de usuario: "+event.returnValues.from)
        console.log("id de factura: "+event.returnValues.adviceId)    
    })
}

const init1 = async () => {
    const provider = new Provider(privateKey, nodeUrl);
    const web3 = new Web3(provider);
    const networkId = await web3.eth.net.getId();
    const myContrat = new web3.eth.Contract(
        MyContrat.abi,
        MyContrat.networks[networkId].address
    );
    myContrat.methods.sendMoneyToWinnerInWei(to_address, Web3.utils.toWei('1', 'wei'))
        .send({ from: address })
        .then((tx) => {
            console.log(tx)
        });

   

}

const init2 = async () => {
    const provider = new Provider(privateKey, nodeUrl);
    const web3 = new Web3(nodeUrl);
    const networkId = await web3.eth.net.getId();
    const myContrat = new web3.eth.Contract(
        MyContrat.abi,
        MyContrat.networks[networkId].address
    );


    const tx = myContrat.methods.sendMoneyToWinnerInWei(to_address, Web3.utils.toWei('0.5', 'ether'));
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



}


event();