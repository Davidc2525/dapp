import Bull from "bull";


import readline from "readline";

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


class FakeAdminConsumer {
    constructor(queue_name) {
        this.queue = new Bull(queue_name);
        this.queue_response = new Bull(queue_name + "_response");


        this.queue.process(this.process.bind(this));
        console.log("FakeAdminConsumer")
    }

    async process(job, done) {
        console.log(job.data);
        let pay_aprobed = true;
        let msg = "aprobada"
        if (job.data.event == "new_pay_with_movil_method") {
            try {
                reader.question(`aprobar inovice, ref: ${job.data.inovice.ref_pay}? `, aprobe => {
                    pay_aprobed = JSON.parse(aprobe)
                    console.log(`aprobado?: ${pay_aprobed}!`);


                    reader.question(`mensaje ?`, _msg => {
                   
                        msg = _msg;
                        console.log(`mensaje ${msg}!`);

                        this.queue_response.add({
                            event: "pay_proccesed",
                            inoviceid: job.data.inovice._id,
                            pay_aprobed,
                            msg
                        })
                        done();
                        
                        //reader.close();
                    });
                });

               
               

            } catch (error) {
                console.log(error)
                done(error);
            }

        }

    }
}

new FakeAdminConsumer("inovices");