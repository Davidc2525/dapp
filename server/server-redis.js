redis = require("redis")

let s_id = Math.floor(Math.random()*100000000);
async function init() {
    const client = redis.createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

   // await client.set('key', 'value');
    const value = await client.get('name');
    console.log(value)

    const sub = client.duplicate();
    await sub.connect();

    sub.subscribe("CANAL", msg =>{
        //console.log(msg)
        const data = JSON.parse(msg);
        //compruebo de que el mensaje no sea de este 
        // mismo servidor para ignorarlo
        if(data.s_id!=s_id){
            console.log(data.msg);
        }
    })

    const pub = client.duplicate();
    await pub.connect();
    let c = 0;
   
    while(1){
        
        await pub.publish('CANAL',JSON.stringify(            
            {s_id,msg:"mensaje "+ (++c)+", s_id: "+s_id}
        ));
    }
}

init();