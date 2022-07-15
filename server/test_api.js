import fetch from "node-fetch"

const token = process.argv[2] != null ? process.argv[2] : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMTY1NTk5MDQ0MDU2OCIsInVzZXJuYW1lIjoiRGF2aWRjMjUyNSIsImVtYWlsIjoiZGF2aWRAZ21haWwuY29tIiwicGFzcyI6bnVsbCwid2FsbGV0X2FkZHJlc3MiOiIwYnhhc2Nhc2MiLCJ3YWxsZXRfYWRkcmVzc19pc19zZXQiOnRydWV9LCJpYXQiOjE2NTc4MTM2NDAsImV4cCI6MTY1NzgxNzI0MH0.SHlyAyF3-nlzoaqeRss7W24GQV_DKKm2sWQs-Tpc0SM"
function rand(_min, _max) {
    return Math.round(Math.random() * (_min - _max) + _max);
}
async function getBalance() {

    const query = `
{
    balance{
      success
      error{
          err
          msg
      }
      balance
    }
  }
  

`
    fetch("http://localhost:8080/api", {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({ query }), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token
        }
    }).then(res => {

        return res.json()

    }).then(({ data }) => {
        console.log((data))
    })
}

async function newBet(amount) {
    const tokens =
        [token,
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMTY1NjAxMzI4MjIzMyIsInVzZXJuYW1lIjoiQW5hIiwiZW1haWwiOiJhbmFAZ21haWwuY29tIiwicGFzcyI6bnVsbCwid2FsbGV0X2FkZHJlc3MiOiIiLCJ3YWxsZXRfYWRkcmVzc19pc19zZXQiOmZhbHNlfSwiaWF0IjoxNjU3NTYxODMzfQ.6li-ykEulADTvKbgZY_rMkZ042lAXRK5-iOC72FwJ28"
        ]

    let t = tokens[0/*rand(0,1) */]

    const query = `
{
  newBetToken(amount: ${amount}) {
    success
    error{
        err
        msg
    }
    PORT
    bet {
      _id
      uid
      numbers
      createat
      win
      win_all
      amount_win
      amount
    }
    
  }
  #balance{ success error{ err msg} balance }
}


`
    return fetch("http://localhost:5000/api", {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({ query }), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + t
        }
    }).then(res => {

        return res.json()

    }).then(({ data }) => data)
}

function createInovice(amountpaid, amountreceived) {

    const query = `
    query{
        createinovice(amountpaid:"${amountpaid.toString()}",amountreceived:"${amountreceived.toString()}"){
         success
         error{
             err
             msg
         }
         inovice {           
           _id
           currencypaid
           currencyreceived
           create
           app
           billing_reason
           cunstomer
           description
           amountreceived
           amountpaid
           state
           method
           pricethen
         }
       }
    }
`
    fetch("http://localhost:8080/api", {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({ query }), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token
        }
    }).then(res => {

        return res.json()

    }).then(({ data }) => {
        console.log((data))
    }).catch(e => console.log(e))
}


async function set_wallet(addr) {
    console.log("set_wallet", addr)

    const query = `
   query {

    setwallet(addr:"${addr}"){
        success
        error{
            err
            msg
        }
        wallet
      }
   }
`
    fetch("http://localhost:5000/api", {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({ query }), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token
        }
    }).then(res => {
        return res.json()

    }).then(({ data }) => {
        console.log(((data)))
    }).catch(e => console.log(e))
}

async function get_wallet() {
    console.log("get wallet")

    const query = `
   query {

    wallet{
        success
        error{
            err
            msg
        }
        wallet
      }
   }
`
    fetch("http://localhost:5000/api", {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({ query }), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token
        }
    }).then(res => {
        return res.json()

    }).then(({ data }) => {
        console.log(((data)))
    }).catch(e => console.log(e))
}



function getBNBPrice() {
    fetch("http://localhost:2525/bnbprice")
        .then((x) => x.json())
        .then(x => console.log(x))
}


//createInovice(0.5,10)
//getBNBPrice()
let c = 0;
let b = 0;
async function main() {
    let t_s = Date.now()
    //await get_wallet()

    //await set_wallet("0x8e0Fc5D403125CDE8C9472B6C02d3b19A552CD1D");
    //await getBalance();
    console.log(await newBet(0.25))
    //await getBalance();

    console.log(Date.now() - t_s)
    return;
    while (true) {

        try {
            console.log("new bet: ", (c++, c++));
            newBet(0.25)
            let d = await newBet(0.25);
            console.log(d.data)
        } catch (error) {
            console.log(error)
        }
    }
}

main()
