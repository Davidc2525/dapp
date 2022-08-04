
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

    setDetails(details) { }
}
class WithdrawMovil extends WithdrawDetail {
    code_bank = "";
    id_constumer = "";
    phone_code = "";//+58 venezuela
    phone_number = "";//0416-5332831
    ref = "";
    img_ref = "";
    
    setDetails({
        code_bank = "",
        id_constumer = "",//documento de identidad
        phone_code = "",
        phone_number = "",
        ref = "",
        img_ref = ""
    }) {
        this.code_bank = code_bank;
        this.id_constumer = id_constumer;
        this.phone_code = phone_code;
        this.phone_number = phone_number;
        this.ref = ref;
        this.img_ref = img_ref;
        return this;
    }
}
class WithdrawCrypto extends WithdrawDetail {
    /**
     * @type string direccion de billetera de retiro
     */
    address_withdraw = "";
    hash = "";

    setDetails({
        address_withdraw = "",
        hash = ""
    }) {
        this.address_withdraw = address_withdraw;
        this.hash = hash;

        return this;
    }
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
        this.img_ref_pay = "";

        this.aprobed_msg = "";//mensaje de aprobacion, si no se aprueba la factura se coloca una razon



    }

    static fromInoviceModel(inoviceModel) {
        let ino = new Inovice();
        ino._id = inoviceModel._id.toString();
        ino.ref_pay = inoviceModel.ref_pay;
        ino.img_ref_pay = inoviceModel.img_ref_pay;
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

        ino.withdraw_details.movil = new WithdrawMovil().setDetails(inoviceModel.withdraw_details.movil);
        ino.withdraw_details.crypto = new WithdrawCrypto().setDetails(inoviceModel.withdraw_details.crypto);
        return ino;
    }
}