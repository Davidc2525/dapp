import express  from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import  mongoose from 'mongoose';
import cors from 'cors'
const SECRET = "23034087";
import jwt from "jsonwebtoken"

import Manager from "./app/managers/Manager.js"
let sm = Manager.SlotGameManager.getInstance();
Manager.BalanceManager.getInstance().transferTo({name:"david"},10)
const bet_value = 1.0;

const UserS = new mongoose.Schema({
    name: {type:String,index:true},
    email: String
});
const BetSchema = new mongoose.Schema({
    //id: String,
    id_user: {type:String,index:true},
    randoms: [Number],
    win: Boolean,
    amount: Number,

})

const BetsCountSchema = new mongoose.Schema({
    id_user: { type: String, index: true },
    count:Number

})
const BalancesSchema = new mongoose.Schema({
    id_user:{ type: String, index: true },
    balance: String
});
const UserModel = mongoose.model('users', UserS);
const BetModel = mongoose.model("bets", BetSchema);
const BalancesModel = mongoose.model("balances",BalancesSchema);
const BetsCountModel = mongoose.model("bets_count",BetsCountSchema);
main().catch(err => console.log(err));

async function main() {
    if(1){
        await mongoose.connect('mongodb://localhost:27017/myweb');
    }else{
    //para conectarme con mongo atlas    
    await mongoose.connect(
      "mongodb+srv://david:23034087@cluster0.7yrgcja.mongodb.net/miapp?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
       
        useUnifiedTopology: true
      }
    );
    }
    //
    
    

    let count = 0;
    return
    while (1) {

        let user = new UserModel({ name: "user " + count, email: "email " + count });
        await user.save();
        console.log("user creado: " + count)
        count++;
    }
}


// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
type User{
    _id:String    
    name:String!
    email:String!        
}
type Bet{
    _id: String,
    id_user: String,
    randoms: [Int],
    win: Boolean,
    amount_win:Float
    amount: String #id,id_user,randoms[],win,amount
}
type strucBalance{
    id_user:String
    balance:String
}
type ResponseBalance{
    succes:Boolean
    error:String
    balance: strucBalance

}
type ResponseBet {
    succes:Boolean
    error:String
    bet : Bet
    balance:strucBalance
    bets:[Bet]
}

type ResponseLogin{
    succes:Boolean!
    error:String!
    token:String
    user:User
}
type Query {
    users(token:String!):[User]
    getPersonsCount:Int!
    getUserByName(name:String!):User
    login(email:String!, pass:String!):ResponseLogin
    balance(id_user:String!):ResponseBalance    

    #api bets
    betsUser(name:String!):ResponseBet
  
    newBet(name:String!,amount:Float!):ResponseBet
}

type Mutation {
    addPerson(name: String!,email:String!): User
    
    #api game, maquina tragamoneda, equivale a una ronda cuesta 0.25$
    #newBet(name:String!):ResponseBet
  }
`);


let users = [{ name: "David" }];
// The root provides a resolver function for each API endpoint
var root = {
    getPersonsCount: () => {
        return UserModel.count()
    },
    balance:async ({id_user})=>{
        const balance = BalancesModel.findOne({id_user});
        return {succes:true,error:null,balance}
    },
    users: async ({token},context) => {
        const cant = await authenticateJWT( token, context.SECRET);
        if(cant){
            
            return await UserModel.find({}).exec()
        }else{
            return[]
        }
    },
    login: async ({ email, pass }, context) => {
      
       
        // const cant = await authenticateJWT( token, context.SECRET);
        if(!email)return {  succes: false, error: "email vacio" }
        if(!pass)return {  succes: false, error: "pass vacio" }
        let u = (await UserModel.findOne({ name: email }).exec())
        let respose = {};
        
        if (u) {
            const token = jwt.sign({ user: u }, context.SECRET)
            respose = { ...respose, succes: true, error: "", user: u, token }
            //context.res.set('Authorization', 'JWT '+token);

            return respose
        }

       return { ...respose, succes: false, error: "usuario: "+email+", no registrado" }

    },
    getUserByName: async ({ name }) => {
        console.log(await UserModel.findOne({ name }).exec())
        return await UserModel.findOne({ name }).exec()
    },
    addPerson: async ({ name, email }) => {
        const user = new UserModel({ name, email })
        return await user.save()

    },
    betsUser: async ({ name }) => {
        const b = await BetModel.find({ id_user: name })
        let res = {};
        if (b.length > 0) {
            res = { ...res, succes: true, bets: b }
        } else {
            res = { ...res, succes: false, error: "no tiene jugadas" }
        }
        return res
    },
    newBet: async ({ name,amount }) => {

        let g = await sm.proccessAndSaveGame(await sm.getNewGame({ id: 123,name:name }, amount));
        console.log("new bet: "+name);
        console.log(g)
        g.randoms = g.numbers;
        let new_balance;
        const new_bet = new BetModel(g);
        let b ;
        const actual_balance = await  BalancesModel.findOne({id_user:name});
        
        //console.log(actual_balance)
        if(actual_balance!=null){
            if(parseFloat(actual_balance.balance) == 0.0||parseFloat(actual_balance.balance) < bet_value){
                return {succes:false,error:"no tienes suficiente balance, recarga tu billetera y continua.",balance:actual_balance}            
            }
            b = await new_bet.save();
            BalancesModel.updateOne({id_user:name},{balance:(parseFloat(actual_balance.balance)-bet_value).toString()}).exec()
            actual_balance.balance = parseFloat(actual_balance.balance) - bet_value;  
            

            //actualizar la cantida de bets realizados
            const mi_bets = await BetsCountModel.findOne({id_user:name});

            if(mi_bets==null){
                new BetsCountModel({id_user:name,count:1}).save();   
            }else{
                BetsCountModel.updateOne({id_user:name},{count:mi_bets.count+1}).exec();
            }
                
            new_balance = actual_balance;  
        }else{
         //aun no tiene balance en la coleccion
             new_balance = await new BalancesModel({id_user:name,balance:"0.0"}).save();
            return {succes:false,error:"no tienes suficiente balance, recarga tu billetera y continua.",balance:new_balance}     
        }
        b.amount_win = g.amount_win;
        return { succes: true, bet:b ,balance:new_balance}
    }
};



const authenticateJWT = ( token, SECRET) => {
    //const authHeader = req.headers.authorization;
    return new Promise((resolve, reject) => {
        if (token) {
            // const token = authHeader.split(' ')[1];

            jwt.verify(token, SECRET, (err, user) => {
                if (err) {
                    console.log(err)
                    reject(false)
                }

               
                resolve(true)
            });
        } else {
            console.log(401)
           reject(false)
        }
    })


};

var app = express();
app.use(cors())
app.use('/api', graphqlHTTP((req, res, next) => {
    return ({
        schema: schema,
        rootValue: root,
        graphiql: true,
        context: { SECRET, req, res, next }
    })
}));
app.listen(2828,"192.168.100.46"/*,"192.168.100.42"*/);
console.log('Running a GraphQL API server at http://192.168.100.46:2828/graphql');
