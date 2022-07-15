
let instance = null;
class CountBetManager {

    constructor() {
        instance = this;

    }

    getInstance() { return instance }
}

export default new CountBetManager();