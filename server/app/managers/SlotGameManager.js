import DefaultSlotGameProvider from "../prividers/SlotGameProvider/DefaultSlotGameProvider.js"


/**
 * @type DefaultSlotGameProvider
 */
let instance = null; 
const p_aw = 3;//%x3
const p_hw = 2;//%x2
class SlotGameManager {

    constructor() {
        instance = null;
      
        instance = new DefaultSlotGameProvider({
            amount_aw:p_aw,
            amount_hw:p_hw
        });
    }
    /**
     * 
     * @returns DefaultSlotGameProvider
     */
    getInstance() { return instance }
}

export default  new SlotGameManager();
