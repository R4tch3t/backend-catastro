const http = require('http');
const hostname = '0.0.0.0';
const port = 3013;
const mysql = require('mysql');
const server = http.createServer((req, res) => {});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    crearQNAS()
});
 
crearQNAS = () => {
    var con = mysql.createConnection({
        host: "localhost",
        user: process.env.NODE_MYSQL_USER,
        password: process.env.NODE_MYSQL_PASS,
        database: "dbsegsistema"
    });

    con.connect((err) => {
        outJSON = {};
        outJSON.error = {};
        if (err) {
            console.log(`Error: ${err}`);
        } else {
            const M = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
            const cDate = new Date()
            const Y = cDate.getFullYear()
            var nQ = ''
            var i = 0
            var j = 1 
            var n = 0
            var nm = 0
            var cm = 1
            while(n<24){
             while (n < 24 && j < 10) {
                 console.log(`%${j%2}`)
                 if (j % 2 === 1){
                    nQ = 'Primera'
                 }else{
                     nQ = 'Segunda'
                 }

                 sql = `INSERT INTO quincenas (año,nombre,descripcion) VALUES (${Y},'QNA${i}${j}${Y}','${nQ} QNA. de ${M[nm]} ${Y}')`;

                
                con.query(sql, function (err, result) {
                    if (err) {
                        console.log(`Error en la consulta: ${err}`);
                    } else {

                        var sql = `SELECT * FROM quincenas `
                        con.query(sql, (err, result, fields) => {
                            if (!err) {
                          //      console.log(result)
                            }
                        })
                        console.log("1 record inserted");
                    }

                });
                n++
                j++
                cm++
                if(cm===3){
                    cm = 1
                    nm++
                }
              }
                i++
                j=0
            }

            //server.close()
            console.log("Connected!");

        }
    });

}
