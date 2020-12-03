let http = require('https');
const hostname = '0.0.0.0';
const port = 3015;
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
let options = null
try {
    options = {
        key: fs.readFileSync(path.join(__dirname, "cert/server.key")),
        cert: fs.readFileSync(path.join(__dirname, "cert/server.cer"))
    }
} catch (e) {
    http = require('http');
    console.log(e)
}
const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const server = http.createServer(options, (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    let inJSON = '';
    let outJSON = {};
    outJSON.error = {};
    let con = mysql.createConnection({
        host: "localhost",
        user: process.env.NODE_MYSQL_USER,
        password: process.env.NODE_MYSQL_PASS,
        database: "dbcatastro"
    });

    // console.log(`${res.host} : ${res.statusCode}`);
    setResponse = async () => {
        //await sleep(6000);
        outJSON = JSON.stringify(outJSON);
        res.end(`${outJSON}`);
        con.destroy();
        server.close();
        server.listen(port, hostname);

    }
    getZone = (c) => {
        if (!c) return 1
        c = c.toLowerCase()
        if (c.includes("eucaria apreza")) {
            return 3
        }
    }
    padron = () => {
        try {
            con.connect((err) => {
                outJSON = {};
                outJSON.error = {};
                if (err) {
                    console.log(`Error: ${err}`);
                } else {
                    let subqueryB = ''
                    let subqueryC = ''
                        //var subqueryN = ''
                        //if (inJSON.CTAnombre!==''){
                    if (inJSON.tipoB != undefined && inJSON.tipoB === 0) {
                        subqueryB = `WHERE p.CTA=${inJSON.CTAnombre}`
                    }
                    if (inJSON.tipoB != undefined && inJSON.tipoB === 1) {
                        subqueryB = `WHERE p.contribuyente LIKE '%${inJSON.CTAnombre}%'`
                    }

                    if (inJSON.idOrden != undefined && inJSON.idOrden !== '') {

                        subqueryC = `AND o.idOrden=${inJSON.idOrden}`
                    }

                    //}
                    let sql = `SELECT * FROM padron${inJSON.tp} p ${subqueryB} ORDER by p.CTA DESC`
                    con.query(sql, (err, result, fields) => {
                        if (!err) {
                            if (result.length > 0) {

                                outJSON.contribuyente = result
                                if (outJSON.contribuyente[0].zona === "0" || outJSON.contribuyente[0].zona === "") {
                                    outJSON.contribuyente[0].zona = getZone(outJSON.contribuyente[0].colonia)
                                }
                                //setResponse()
                                sql = `SELECT * FROM ubipredio${inJSON.tp} u `
                                sql += `WHERE u.CTA=${result[0].CTA} ORDER by u.CTA DESC`
                                    //console.log(sql)
                                con.query(sql, (err, result, fields) => {

                                    if (!err) {
                                        if (result.length > 0) {
                                            outJSON.ubicacion = result

                                            sql = `SELECT * FROM ordenes${inJSON.tp} o `
                                            sql += `WHERE o.CTA=${result[0].CTA} ${subqueryC} ORDER by o.idOrden DESC`
                                            con.query(sql, (err, result, fields) => {
                                                if (!err) {
                                                    if (result.length > 0) {
                                                        outJSON.orden = result[0]
                                                        if (outJSON.orden.zona === "0" || outJSON.orden.zona === "") {
                                                            outJSON.orden.zona = getZone(outJSON.orden.colonia)
                                                        }
                                                        /*sql = `SELECT * FROM predial${inJSON.tp} p `
                                                        sql += `WHERE p.idOrden=${result[0].idOrden} ORDER by p.idImpuesto ASC`
                                                        con.query(sql, (err, result, fields) => {
                                                            if (!err) {
                                                              if (result.length > 0) {
                                                                outJSON.predial = result
                                                              }
                                                            }
                                                            setResponse()
                                                        });*/

                                                    } else {
                                                        //setResponse()
                                                    }
                                                }
                                                setResponse()
                                            });
                                        } else {
                                            outJSON.ubicacion = [{
                                                calle: '',
                                                lote: 0,
                                                manzana: '',
                                                numero: 0,
                                                colonia: '',
                                                cp: 0,
                                                municipio: '',
                                                localidad: '',
                                                basegrav: 0
                                            }]
                                            setResponse()
                                        }
                                    } else {

                                    }

                                });
                            } else {
                                outJSON.error.name = 'error01'
                                setResponse()
                            }
                        } else {

                        }
                    });


                }
            });
        } catch (e) {
            console.log(e)
        }

    }

    req.setEncoding('utf8');

    req.on('data', (chunk) => {
        inJSON += chunk;
    }).on('end', () => {

        try {
            inJSON = JSON.parse(inJSON);
            // var base64Data = inJSON.base64.replace(/^data:image\/jpg;base64,/, "");
            outJSON.error.name = 'none';
            outJSON.error.name2 = 'none';

        } catch (e) {
            //console.clear()
            console.log(`error: ${e}`);
            outJSON.error.name = `${e}`;
        }

        if (inJSON.CTAnombre) {

            padron()

        } else {
            res.end()
        }
    });
});
//server.maxConnections = 1
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});