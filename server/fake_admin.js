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

        this.withdraw_queue = new Bull("withdraw_movil");
        this.withdraw_queue_response = new Bull("withdraw_movil_response");
        this.withdraw_queue.process(this.process.bind(this))

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

        if (job.data.event == "withdraw") {
            try {
                reader.question(`Nuevo retiro a ${job.data.user.username} de ${job.data.inovice.amountpaid}$`, aprobe => {
                    let withdraw_aprobed = JSON.parse(aprobe)


                    if(withdraw_aprobed){
                        reader.question(`referencia de pago ?`, ref => {
                   
                        
                            this.withdraw_queue_response.add({
                                event: "withdraw_proccesed",
                                inoviceid: job.data.inovice._id,
                                withdraw_aprobed,
                                ref
                            })
                            done();
                            
                            //reader.close();
                        });
                    }else{
                        reader.question(`razon de rechazo ?`, reason => {
                   
                        
                            this.withdraw_queue_response.add({
                                event: "withdraw_proccesed",
                                inoviceid: job.data.inovice._id,
                                withdraw_aprobed,
                                reason
                            })
                            done();
                            
                            //reader.close();
                        });
                    }
                });

               
               

            } catch (error) {
                console.log(error)
                done(error);
            }

        }

    }
}

new FakeAdminConsumer("inovices");