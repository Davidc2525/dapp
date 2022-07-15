import React, { Component } from "react"
import { render } from "react-dom"
import Web3 from "web3"
import { ethers } from "ethers"
const addres = "0x6F7200d0332132eD79a4f3b34324f1407c40657f";
import Bingo from "../../build/contracts/Bingo.json"

class App extends Component {


    constructor(props) {
        super(props);
        this.state = {
            account: '',
            metaConnect: false,
            _to: "",
            _value: 0,
            balance: 0,
            miCards: 0
        }


        this.web3 = null;

        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
            this.web3 = new Web3(window.ethereum);
            window.web3 = this.web3;
            this.web3.eth.requestAccounts().then((accounts) => {
                const account = accounts[0];
                this.setState({ account })


                this.web3.eth.getBalance(account).then((b) => {
                    this.setState({
                        balance: ethers.utils.formatEther(b)
                    })
                })

                this.getCardsByAddress();

                let contract = new this.web3.eth.Contract(Bingo.abi, addres);
                let evento = contract.events.cardId();
    
                evento.subscribe((err,result)=>{
                    if(!err){
                        console.log("evento: ");
                        console.log(result)
                    }
                })
    

            });

            ethereum._handleAccountsChanged = (a) => {
                console.log(a);
                this.setState({ account: a[0] })
            }



           
        }

        
    }
    connectWithMetamask = () => {




    }
    updateAddres = (e) => {
        this.setState({ _to: e.target.value })
    }
    updateAmount = (e) => {
        this.setState({ _value: e.target.value })
    }
    getCardsByAddress = () => {

        console.log("get cards")
        let contract = new this.web3.eth.Contract(Bingo.abi, addres);


        contract.methods.getCardsByAddress(this.state.account)
            .call()
            .then((e) => {
                console.log("cartones: " + e)
                this.setState({ miCards: e })
            })
    }
    sendT = () => {
        console.log("comprar carton")
        let contract = new this.web3.eth.Contract(Bingo.abi, addres);
        console.log(contract)
        contract.methods
            .buyCard()
            .send({ from: this.state.account.toString(), value: Web3.utils.toWei((this.state._value).toString(), 'ether') })
            .then(() => {
                contract.methods.getBalance().call().then((e) => {
                    console.log(e)
                    this.getCardsByAddress();
                })
            })

    }

    render() {
        return (
            <div>Dapp
                <br></br>
                <h3>Conectate con metamask</h3>
                <h2>{this.state.account}</h2>
                <h2>{this.state.balance}</h2>
                <button onClick={this.connectWithMetamask}>Conectar metamask</button>
                <br />

                <h4>{this.state._value}</h4>
                para: <input type="text" onChange={this.updateAddres} />
                <br />
                pagar: <input type="number" onChange={this.updateAmount} />
                <br />
                <button onClick={this.sendT}>Transferir a la cuenta </button>

                <br />
                mis cartones: {this.state.miCards}


            </div>

        );
    }
}

export default App;