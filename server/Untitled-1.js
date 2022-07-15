max_cards_peer_game = 8;
letra = "-"
max_bool = 48;
sigue = "s"
const cost_card = 0.003;
min = 1;
max = 75;
function rand(_min, _max) {
    return Math.round(Math.random() * (_min - _max) + _max);
}
function generate_game() {
    let game_numbers = []
    let count = 1;
    do {
        let numero = rand(min, max);



        if (numero >= 1 && numero <= 15) letra = "b";
        if (numero >= 16 && numero <= 30) letra = "i";
        if (numero >= 32 && numero <= 45) letra = "n";
        if (numero >= 46 && numero <= 60) letra = "g";
        if (numero >= 61 && numero <= 75) letra = "o";

        if (!game_numbers.includes(numero)) {
            //console.log(count + " " + letra + numero)
            game_numbers.push(numero)
            //sigue = prompt("salio " +letra+ numero + ", continuar?")
            count++;
        }

    } while (count <= max_bool)
    //console.log(game_numbers)
    return game_numbers;
}
class Games {
    constructor() {
        this._games = [];
    }
    addGame(game) { }
    getGame(id) { }
}
class Game {
    constructor() {
        this._players = [];
        this._id = Date.now();
        this._cards = [];
        this._numbers = generate_game();
        this._status = 0;//0 created, 1 waiting, 2 playing, 3 finalized
        this._amount = 0;//bnb en la partida

    }
    addPlayer(player){

    }
    addCard(card) {
        this._cards.push(card)

    }
    setState(state) {
        this._status = state;
    }
}

class User {
    constructor(address) {
        this._address = address;
        this._credit = 0;
    }
    setCredit(amount) { this._credit = amount; }
    getCredit() { return this._credit; }

}

class Player extends User {

    constructor(address) {
        super(address)
        this._cards = [];
        this._game_amount = 0;
    }
    getCars(){return this._cards;}
    buyCards(count) {
        if (this.getCredit() >= (count * cost_card)) {
            for (let index = 0; index < count; index++) {

                let card = new Card();
                card._owner = this;
                this._cards.push(card);
                this._game_amount += cost_card;//aqui se suma el valor actial de un carton

            }
            let credit = this.getCredit();
            credit -= this._game_amount;
            this.setCredit(credit);
        }

    }
}
class CardIten {

    constructor(n) {
        this._n = n;
        this._include = null;
        this._mark = false;
    }
}
class Card {
    constructor() {
        this._owner = null;
        this._items = null;
        this._w = 5;
        this._h = 5;
        this._id = Date.now();

        this._generateItems();
    }

    _includeItem(n) {
        let include = false;
        let x, y;
        for (let index = 0; index < this._w; index++) {
            for (let _i = 0; _i < this._h; _i++) {
                x = index;
                y = _i;
                if (this._items[index][_i]._n == n) {
                    //console.log(n+" esta "+this._items[index][_i]._n )
                    // this._items[index][_i]._mark = true;
                    include = true;
                    return [include, x, y];
                }
            }
        }


        return [include, x, y];
    }

    _mark(x, y) {
        this._items[x][y]._mark = true;
    }
    _un_mark(x, y) {
        this._items[x][y]._mark = fale;
    }
    _markIfInclude(n) {
        let include = false;
        for (let index = 0; index < this._w; index++) {
            for (let _i = 0; _i < this._h; _i++) {
                if (this._items[index][_i]._n == n) {
                    //console.log(n+" esta "+this._items[index][_i]._n )
                    this._items[index][_i]._mark = true;
                    include = true;
                    return include;
                }
            }
        }


        return include;
    }


    _generateItems() {
        this._items = Array.from({ length: this._w });
        for (let index = 0; index < this._items.length; index++) {

            if (index == 0) {
                this._items[index] = Array.from({ length: this._h }, () => new CardIten(0));
                for (let _i = 0; _i < this._items[index].length; _i++) {
                    this._items[index][_i] = new CardIten(0);
                    let _n = rand(1, 15);
                    while (this._items[index].findIndex((item) => item._n == _n) != -1) {
                        _n = rand(1, 15)
                    }
                    this._items[index][_i] = new CardIten(_n);
                }
            };
            if (index == 1) {
                this._items[index] = Array.from({ length: this._h }, () => new CardIten(0));
                for (let _i = 0; _i < this._items[index].length; _i++) {
                    this._items[index][_i] = new CardIten(0);
                    let _n = rand(16, 30);
                    while (this._items[index].findIndex((item) => item._n == _n) != -1) {
                        _n = rand(16, 30)
                    }
                    this._items[index][_i] = new CardIten(_n);
                }
            };
            if (index == 2) {
                this._items[index] = Array.from({ length: this._h }, () => new CardIten(0));
                for (let _i = 0; _i < this._items[index].length; _i++) {
                    this._items[index][_i] = new CardIten(0);
                    let _n = rand(32, 45);
                    while (this._items[index].findIndex((item) => item._n == _n) != -1) {
                        _n = rand(32, 45);
                    }
                    this._items[index][_i] = new CardIten(_n);
                    this._items[index][2]._n = 0;
                    this._items[index][2]._mark = true;
                }
            };
            if (index == 3) {
                this._items[index] = Array.from({ length: this._h }, () => new CardIten(0));
                for (let _i = 0; _i < this._items[index].length; _i++) {
                    this._items[index][_i] = new CardIten(0);
                    let _n = rand(46, 60);
                    while (this._items[index].findIndex((item) => item._n == _n) != -1) {
                        _n = rand(46, 60)
                    }
                    this._items[index][_i] = new CardIten(_n);
                }
            };
            if (index == 4) {
                this._items[index] = Array.from({ length: this._h }, () => new CardIten(0));
                for (let _i = 0; _i < this._items[index].length; _i++) {
                    this._items[index][_i] = new CardIten(0);
                    let _n = rand(61, 75);
                    while (this._items[index].findIndex((item) => item._n == _n) != -1) {
                        _n = rand(61, 75)
                    }
                    this._items[index][_i] = new CardIten(_n);
                }
            };




        }
    }
}



function play_game() {
    let card = new Card()
    let game = generate_game()

    console.log(game)



    for (let index = 0; index < game.length; index++) {

        let include = card._includeItem(game[index]);
        if (include[0]) {

            card._mark(include[1], include[2])
            console.log("esta en el carton " + game[index])
        }
    }
    console.log(card._items)
}


for (let index = 0; index < 1; index++) {

    play_game()
}


