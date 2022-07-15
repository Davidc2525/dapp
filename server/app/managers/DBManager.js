import mongoose from 'mongoose';
import "dotenv/config";


let instance = null;
class DBManager {

    constructor() {
        instance = this;

        this.con();

    }
    async con() {
        if (1) {

            //await mongoose.connect('mongodb://localhost:2717,localhost:2727,localhost:2737/?replicaSet=myweb2');
            await mongoose.connect(process.env.DB_URL_CONNECTION);
        } else {
            //para conectarme con mongo atlas    
            await mongoose.connect(
                "mongodb+srv://david:23034087@cluster0.7yrgcja.mongodb.net/miapp?retryWrites=true&w=majority",
                {
                    useNewUrlParser: true,

                    useUnifiedTopology: true
                }
            );
        }
    }

    getInstance() { return instance }
}

export default new DBManager();