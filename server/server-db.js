

rethinkdb = require("rethinkdb")


r = require('rethinkdb')

r.connect({ host: 'localhost', port: 28015 }, function (err, conn) {
    if (err) throw err;
    
    r.table('tv_shows').insert({id:"123456" ,name: 'casados con hijos' }).run(conn, function (err, res) {
        if (err) throw err;
        console.log(res);
    });

    r.table("tv_shows").run(conn,(err,cursos)=>{
        if(err) throw err;
        cursos.toArray((err, result)=>{
            console.log(result)
        })
    })
});