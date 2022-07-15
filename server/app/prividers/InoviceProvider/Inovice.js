



/**
 * Clase factura
 */
export default class Inovice {

    constructor() {
        this._id;
        this.currencypaid = "BNB"//VES o BNB
        this.currencyreceived = "USD";
        this.create = 0;
        this.app = "web";
        this.billing_reason = "recharge";//recharge o withward
        this.cunstomer = null;//User.id
        this.description = "Recarga de credito.";
       
        this.amountreceived = "0.0"; //usd
        this.amountpaid = "0"; //bnb, expresado en wei

        this.state = "CREATED"; //CREATED, PAID, CANCELED, PENDING, COMPLETED
        this.method = "CRYPTO"; //CRYPTO , PAGOMOBIL

        /**
         * si se recarga con bs y el method es PAGOMOBIL se coloca la cantidad que costo el dolar 
         * al momento de hacer la recargfa
         * 
         * si se cancelo con bnb se coloca el precio de bnb
         */
        this.pricethen = "0";

    }

    static fromInoviceModel(inoviceModel) {
        let ino = new Inovice();
        ino._id = inoviceModel._id;
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

        return ino;
    }
}