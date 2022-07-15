import nodemailer from "nodemailer"
import { google } from "googleapis"
import Bull from "bull";
const credentials =
{
    client_id: '843650094886-2tklscu194sn44fui1mj9mgp2fik0bj0.apps.googleusercontent.com',
    project_id: 'hhcloud-29d6a',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: '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',
    redirect_uris: ['https://developers.google.com/oauthplayground']
};

const r_token = "1//04bhd00PB4-5QCgYIARAAGAQSNwF-L9IrPHLnj59xS1yaaayZunXbuTlrOiH5p2-tS_2aY4TuE79asf7tdd344lEu7cBNJwz-l0s";


class RedisQueueConsumer {
    constructor(queue_name) {
        this.queue = new Bull(queue_name);
        this.email_service = new EmailService();


        this.queue.process(this.process.bind(this))
    }

    async process(job, done) {
        console.log(job.data)
        if (job.data.event == "active_account") {
            try {
                await this.email_service.sendActiveAccount(new BasicDataUser(job.data.user));
                done();

            } catch (error) {
                console.log(error)
                done(error);
            }

        }
        if (job.data.event == "forgot_pass") {
            try {
                await this.email_service.sendForgotPassworrd(new BasicDataUser(job.data.user));
                done();
            } catch (error) {
                console.log(error)

                done(error)
            }
        }
    }
}
class BasicDataUser {

    constructor({ id = null, username = null, email = null, pass = null, wallet_address = null, wallet_address_is_set = null } = {}) {
        //this._id;
        /**
         * username de usuario
         * @type {string}
         */
        this.username = username;
        /**
         * correo de usuario
         * @type {string}
         */
        this.email = email;


    }
}
class EmailService {
    constructor() {
        console.log(credentials)
        this.oAuth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris[0]);

        this.oAuth2Client.setCredentials({ refresh_token: r_token })
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        //let testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAUTH2",
                user: "david25pcxtreme@gmail.com",
                clientId: credentials.client_id,
                clientSecret: credentials.client_secret,
                refreshToken: r_token,
                //accessToken

            }
        });

    }

    /**
     * 
     * @param {BasicDataUser} user 
     */
    async sendActiveAccount(user) {
        console.log("DEBUG sendActiveAccount", user)
        // send mail with defined transport object
        let info = await this.transporter.sendMail({
            from: '"BetBlizt Admin" <foo@example.com>', // sender address
            to: user.email, // list of receivers
            subject: "Activa tu cuenta ahora ✔", // Subject line
            text: "", // plain text body
            html: `
                <h1>Hola ${user.username}, debes activar tu cuenta.</h1>
                <p>sigue el enlace para continuar <a href="http://localhost:4000/">Activar</a></p>
            `
        });

        console.log("DEBUG sendActiveAccount completed ", info)
    }
    /**
     * 
     * @param {BasicDataUser} user 
     */
    async sendForgotPassworrd(user) {
        // send mail with defined transport object
        let info = await this.transporter.sendMail({
            from: '"BetBlizt Admin" <foo@example.com>', // sender address
            to: user.email, // list of receivers
            subject: "Cambio de clave ✔", // Subject line
            text: "", // plain text body
            html: `
        <h1>Hola ${user.username}, olvidaste tu clave.</h1>
        <p>copia el codigo para cambiar la clave 123456</p>
    `
        });

        console.log(info)
    }
}

async function start_service() {
    console.log("DEBUG servicio email activado")
    const consumer = new RedisQueueConsumer("email");
}

start_service();

