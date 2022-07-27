
/**
 * Enum for state values.
 * @readonly
 * @enum {string}
 */
var State = {

    CREATED: "CREATED",
    PAID: "PAID",
    CANCELED: "CANCELED",
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    DECLINED: "DECLINED"
};

/**
 * Enum for state pay methods.
 * @readonly
 * @enum {string}
 */
var PayMethods = {

    CRYPTO: "CRYPTO",
    MOVIL: "MOVIL",
};
export { State, PayMethods }

class WithdrawDetail {
    created = Date.now().toString();
}
class WithdrawMovil extends WithdrawDetail {
    code_bank = "";
    id_constumer = "";
    phone_code = "";
    phone_number = "";
    ref = "";
}
class WithdrawCrypto extends WithdrawDetail {
    /**
     * @type string direccion de billetera de retiro
     */
    address_withdraw = "";
    hash = "";
}

class WithdrawDetails {
    crypto = new WithdrawCrypto();
    movil = new WithdrawMovil();
}
/**
 * Clase factura
 */
export default class Inovice {
    _id;
    /**
     * @type WithdrawDetails
     */
    withdraw_details = new WithdrawDetails();;
    constructor() {
        this._id;
        this.currencypaid = "BNB"//VES o BNB
        this.currencyreceived = "USD";
        this.create = 0;
        this.app = "web";
        this.billing_reason = "recharge";//recharge o withdraw
        this.cunstomer = null;//User.id
        this.description = "Recarga de credito.";

        this.amountreceived = "0.0"; //usd
        this.amountpaid = "0"; //bnb, expresado en wei

        /**
         * @type {State}
         */
        this.state = State.CREATED; //CREATED, PAID, CANCELED, PENDING, COMPLETED
        this.method = PayMethods.CRYPTO; //CRYPTO , PAGOMOVIL

        /**
         * si se recarga con bs y el method es PAGOMOBIL se coloca la cantidad que costo el dolar 
         * al momento de hacer la recargfa
         * 
         * si se cancelo con bnb se coloca el precio de bnb
         */
        this.pricethen = "0";

        /**
         * @type string
         */
        this.ref_pay = "0";//codigo de referencia

        this.aprobed_msg = "";//mensaje de aprobacion, si no se aprueba la factura se coloca una razon



    }

    static fromInoviceModel(inoviceModel) {
        let ino = new Inovice();
        ino._id = inoviceModel._id.toString();
        ino.ref_pay = inoviceModel.ref_pay;
        ino.currencypaid = inoviceModel.currencypaid;
        ino.currencyreceived = inoviceModel.currencyreceived;
        ino.create = inoviceModel.create;
        ino.app = inoviceModel.app;
        ino.billing_reason = inoviceModel.billing_reason;
        ino.cunstomer = inoviceModel.cunstomer;
        ino.description = inoviceModel.description;
        ino.amountreceived = inoviceModel.amountreceived;
        ino.amountpaid = inoviceModel.amountpaid;
        ino.state = inoviceModel.state;
        ino.method = inoviceModel.method;
        ino.pricethen = inoviceModel.pricethen;
        ino.aprobed_msg = inoviceModel.aprobed_msg;

        return ino;
    }
}