function rand(_min, _max) {
    return Math.round(Math.random() * (_min - _max) + _max);
}

export class SlotGame {
    constructor(user, slots, amount) {
        this.uid = user.id;
        this.createat = Date.now();
        this.user = user;
        this.amount_win = 0;
        this.amount = amount;
        this.numbers = Array.from({ length: slots }); //Array.from({ length: slots });
        this.win = false;
        this.win_all = false;
        this.mega_win = false;
        this.wins = 0;
        for (let index = 0; index < this.numbers.length; index++) {
            this.numbers[index] = rand(0, 9);
        }


        this.play2();
    }
    play() {


        let duplicateds = [];

        const tempArray = [...this.numbers].sort();
        for (let i = 0; i < tempArray.length; i++) {
            if (tempArray[i + 1] == tempArray[i]) {

                if (true || duplicateds.includes(tempArray[i])) {

                    duplicateds.push(tempArray[i]);
                }
            }
        }

        this.duplicate = Array.from(new Set(duplicateds));
        this.win = duplicateds.length > 0 ? true : false;
        this.wins = this.win ? duplicateds.length + 1 : 0;
        this.win_all = this.win && this.wins == 3;

    }

    play2() {
        if (this.numbers[0] == this.numbers[1] && this.numbers[1] == this.numbers[2]) {
            this.win_all = true;
            this.mega_win = this.numbers[0] == 0; //figura 777           
        }
    }
}
