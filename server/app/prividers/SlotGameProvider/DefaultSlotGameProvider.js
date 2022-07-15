
import Manager from "../../managers/Manager.js";
import { Payload } from "../RealTimeProvider/Payload.js";
import { SlotGameObservable } from "./SlotGameObservable.js";
import mongoose from "mongoose";
import { SlotGame } from "./SlotGame.js";
function generate_game(_max) {
    let game_numbers = []
    let count = 1;
    do {
        let numero = rand(min, max);

        if (!game_numbers.includes(numero)) {

            game_numbers.push(numero)

            count++;
        }

    } while (count <= _max)
    //console.log(game_numbers)
    return game_numbers;
}
export function rand(_min, _max) {
    return Math.round(Math.random() * (_min - _max) + _max);
}

export {SlotGame};
export default class DefaultSlotGameProvider extends SlotGameObservable{


    constructor({
        slots,
        amount,
        amount_aw,
        amount_hw
    }) {
        super();
        this.slots = slots ? slots : 3;
        this.amount = amount ? amount : 0.25;
        this.amount_aw = amount_aw ? amount_aw : 2.6;//260%
        this.amount_hw = amount_hw ? amount_hw : 0.9;//90%
         /**
         * @type {SlotGameOserver[]}
         */
          this.observers = [];
        console.log("DEBUG DefaultSlotGameProvider");

        this.bet = [0.25, 0.50, 0.75, 1];
        this.reward = [

            [125, 25, 12.50, 11.25, 10, 8.75, 7.50, 6.25, 5, 3.75],
            [250, 50, 25, 22.50, 20, 17.50, 15, 12.50, 10, 7.50],
            [375, 75, 37.50, 33.75, 30, 26.25, 22.50, 18.75, 15, 11.25],
            [500, 100, 50, 45, 40, 35, 30, 25, 20, 15]

        ];



        const BetSchema = new mongoose.Schema({
            //id: String,
            uid: { type: String, index: true },
            numbers: [Number],
            createat: Number,
            win: Boolean,
            amount: Number,
            amount_win: Number,
            mega_win: Boolean,
            wins: Number,
            win_all: Boolean,
            duplicate: [Number]
        });

        const BetsCountSchema = new mongoose.Schema({
            id_user: { type: String, index: true },
            count: Number

        })
        this.BetsCountModel = mongoose.model("bets_count", BetsCountSchema);
        this.BetModel = mongoose.model("bets", BetSchema);
    }
    /**
     * @type @{SlotGame}
     * @returns @{SlotGame}
     */
    async getNewGame(user, amount) {
        //if(Manager.BalanceManager.getInstance().getOf(user)<amount) throw new Error("sin fondos")
        const index_bet = this.bet.indexOf(amount);
        //console.log("DEBUG getNewGame index",index_bet)
        if (index_bet == -1) {
            const msg = "cantidad no admitida: " + amount + ", debe ingresar: " + this.bet

            console.log(msg)
            throw { err:"no_admited_amount", msg }

        }
        await Manager.BalanceManager.getInstance().transferFrom(user, amount)

        return new SlotGame(user, this.slots, amount);
    }

    /**
     * 
     * @param {SlotGame} slotGame 
     * @returns {Promise<SlotGame>}
     */
    async proccessAndSaveGame(slotGame) {
        return this.proccessAndSaveGame2(slotGame);

        let amount_pay = 0;
        let some_win = false;
        if (slotGame.win_all) {
            some_win = true;
            amount_pay = (slotGame.amount * this.amount_aw);
        }
        if (slotGame.win) {
            some_win = true;
            if (!slotGame.win_all) amount_pay = slotGame.amount * this.amount_hw;
        }

        slotGame.amount_win = amount_pay;

        Manager.BalanceManager.getInstance().transferTo(slotGame.user, amount_pay)
            .catch((error) => {
                console.log("proccessAndSaveGame error " + error)
            });

        var slotGameModel = await new this.BetModel(slotGame).save();
        slotGame._id = slotGameModel._id;
        const mi_bets = await this.BetsCountModel.findOne({ id_user: slotGame.user.id });

        if (mi_bets == null) {
            new this.BetsCountModel({ id_user: slotGame.user.id, count: 1 }).save();
        } else {
            this.BetsCountModel.updateOne({ id_user: slotGame.user.id }, { count: mi_bets.count + 1 }).exec();
        }
        return slotGame;
    }
     /**
     * 
     * @param {SlotGame} slotGame 
     * @returns {Promise<SlotGame>}
     */
    async proccessAndSaveGame2(slotGame) {
        //console.log("DEBUG proccessAndSaveGame2")
        let amount_pay = 0;
        let some_win = false;
        if (slotGame.win_all) {
            some_win = true;
            const index_bet = this.bet.indexOf(slotGame.amount);
            // console.log("DEBUG index",index_bet)
            if (index_bet == -1) {
                const msg = "cantidad no admitida: " + slotGame.amount + ", debe ingresar: " + this.bet

                console.log(msg);
                throw { err:"no_admited_amount", msg }

            }
            amount_pay = this.reward[index_bet][slotGame.numbers[0]];
        }

        slotGame.amount_win = amount_pay;

        Manager.BalanceManager.getInstance().transferTo(slotGame.user, amount_pay)
            .catch((error) => {
                console.log("ERRPR proccessAndSaveGame2 error " + error)
            });

        var slotGameModel = await new this.BetModel(slotGame).save();
        slotGame._id = slotGameModel._id;
        const mi_bets = await this.BetsCountModel.findOne({ id_user: slotGame.user.id });

        //consume 5ms
        if (mi_bets == null) {
            new this.BetsCountModel({ id_user: slotGame.user.id, count: 1 }).save();
        } else {
            this.BetsCountModel.updateOne({ id_user: slotGame.user.id }, { count: mi_bets.count + 1 })
            .then(x=>{})
            .catch(err=>console.log("ERROR proccessAndSaveGame2 BetsCountModel.updateOne ",err))
        }


        //enviar notificacion a todos los clientes y servidores
        if (slotGame.win_all){
            /**
             * notificamos a todos los observadores 
             * de que se realizo un mega win
             */
            this.notifyToUser(slotGame);
            //if(rand(0,100)>80)
                this.notifyWinAll(slotGame);
            
            //broad cast a clientes socket
            //const payload = new Payload("user_win", { bet:slotGame });
           // Manager.getRealTimeProvider().broadCast(payload)
            
            
            //broad cast a los demas servidores
            //Manager.getCacheAndPubServiceProvider().publish("BROAD_CAST",JSON.stringify(payload))
        }
        return slotGame;
    }

   

}