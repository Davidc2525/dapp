
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
//console.log('directory-name 👉️', __dirname);

const schema = fs.readFileSync(path.resolve(__dirname, './api_eshema.graphql'));
export default schema+"";
/**
export default  `type User{
    _id:String
    id:String
    username:String
    email:String
    wallet_address:String
    wallet_address_is_set:Boolean
}
type strucBalance{
    id_user:String
    balance:String
}
type Bet{
    _id: String,
    uid: String,
    numbers: [Int],
    createat: String,
    win: Boolean,
    win_all: Boolean
    mega_win:Boolean
    amount_win:String
    amount: String #id,id_user,randoms[],win,amount
}
type ResponseUser{
    success:Boolean
    error:String
    user:User
}
type ResponseBet {  
    PORT:String
    success:Boolean
    error:String
    bet : Bet
    balance:String
}

type ResponseBalance{
    success:Boolean
    error:String
    balance:String
}

type ResponseLogin{
    success:Boolean!
    error:String!
    token:String
    user:User
}
type Inovice{
    _id:String
    currencypaid:String
    currencyreceived:String
    create:Int
    app:String
    billing_reason:String
    cunstomer:String
    description:String
    amountreceived:String
    amountpaid:String
    state:String
    method:String
    pricethen:String
    
}
type ResponseInovice{
    success:Boolean
    error:String
    inovice:Inovice
}

type ResponseInovices{
    success:Boolean
    error:String
    inovice:[Inovice]
}
type ResponseWallet {
    success :Boolean
    error:String
    wallet:String
} 
#API--------------------------------------------------------------------------------
type Query {
    #user api
    byId(id:String):ResponseUser
    create(email:String!,pass:String!):ResponseUser
    login(email:String!,pass:String!):ResponseLogin
    setwallet(addr:String):ResponseWallet
    wallet:ResponseWallet

    #balance
    balanceByIdUser(id:String):ResponseBalance

    #con token de sesion
    balance:ResponseBalance

    #api bets
    #betsUser(name:String!):ResponseBet    
    #aqui ya tiene q ir el token de sesion
    #newBet(uid:String!,amount:Float!):ResponseBet

    newBetToken(amount:Float!):ResponseBet


    #api inovice
    createinovice(amountpaid:String!,amountreceived:String!):ResponseInovice
    cancelinovice(inoviceid:String!):ResponseInovice
    inovices:ResponseInovices


    promise:Int
}
`;

*/