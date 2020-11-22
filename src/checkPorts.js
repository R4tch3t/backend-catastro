let http = require('https');
const hostname = '0.0.0.0';
const port = 2999;
const mysql = require('mysql');
portTable = {}
 const fs = require('fs');
 const path = require('path');
 let options = null
 try{
     options = {
         key: fs.readFileSync(path.join(__dirname, "cert/server.key")),
         cert: fs.readFileSync(path.join(__dirname, "cert/server.cer"))
     }
 }catch(e){
     http = require('http');
     console.log(e)
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
    setResponse = () => {
        outJSON = JSON.stringify(outJSON);
        res.end(`${outJSON}`);
        con.destroy();
        server.close();
        server.listen(port, hostname);

    }

    getSubDataNoCTA = (result, idOrden) => {
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
        outJSON.orden = result
        sql = `SELECT * FROM formas f `
        sql += `WHERE f.idOrden=${idOrden} ORDER by f.idForma DESC`
        con.query(sql, (err, result, fields) => {
            if (result.length > 0) {
                outJSON.formas = result
            }
            setResponse()
        })
    }

    getSubData = (tp, idOrden) => {
        let sql = `SELECT * FROM ordenes${tp} o `
        sql += `WHERE o.idOrden=${idOrden} ORDER by o.idOrden DESC`
        con.query(sql, (err, result, fields) => {
            if (!err) {
                if (result.length > 0) {
                    outJSON.orden = result[0]
                    sql = `SELECT * FROM padron${tp} p WHERE p.CTA=${outJSON.orden.CTA} ORDER by p.CTA DESC`
                    con.query(sql, (err, result, fields) => {
                        if (!err) {
                            if (result.length > 0) {
                                outJSON.contribuyente = result
                                sql = `SELECT * FROM ubipredio${tp} u `
                                sql += `WHERE u.CTA=${result[0].CTA} ORDER by u.CTA DESC`
                                    //console.log(sql)
                                con.query(sql, (err, result, fields) => {

                                    if (!err) {
                                        if (result.length > 0) {
                                            outJSON.ubicacion = result
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
                                        }
                                        setResponse()
                                    }
                                })
                            }
                        }
                    })
                } else {
                    setResponse()
                }
            }
        });

    }

    checkPorts = (port = 3031) => {
        try {
            console.log("portTable:")
            console.log(portTable)
            switch (parseInt(inJSON.op)) {
                case 0:

                    if (portTable[port] === undefined) {
                        portTable[port] = {}
                        portTable[port].CTA = inJSON.CTA
                        const today = new Date()
                        const nextDay = new Date()
                        nextDay.setUTCFullYear(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                        portTable[port].dateIn = today
                        portTable[port].dateOut = nextDay
                        outJSON.portEn = { n: port }
                        setResponse()
                    } else {
                        if (portTable[port].CTA === inJSON.CTA) {
                            const today = new Date()
                            if (today.getTime() > portTable[port].dateOut.getTime()) {
                                outJSON.portEn = { n: port }
                            } else {
                                portTable[port] = undefined

                            }
                            setResponse()
                        } else {
                            const today = new Date()
                            if (today.getTime() >= portTable[port].dateOut.getTime()) {
                                portTable[port] = undefined
                                checkPorts(parseInt(port))
                            } else {
                                //outJSON.portEn = { n: inJSON.port + 1 }
                                checkPorts(parseInt(port) + 1)
                            }
                        }
                    }


                    break;
                case 1:
                    portTable[inJSON.port] = undefined;
                    outJSON.exito = 1;
                    setResponse()
                    break;
            }

        } catch (e) {
            console.log(e)

        }

    }

    checkPorts_1 = () => {
        try {
            con.connect((err) => {
                outJSON = {};
                outJSON.error = {};
                if (err) {
                    console.log(`Error: ${err}`);
                } else {
                    let sql = `SELECT * FROM ports p WHERE p.estado=0 ORDER by p.n ASC`
                    con.query(sql, (err, result, fields) => {
                        if (result.length > 0) {
                            outJSON.portEn = result[0]

                            sql = `UPDATE ports SET estado=1 WHERE idPort=${result[0].idPort}`
                            con.query(sql, (err, result, fields) => {
                                setResponse();
                            })
                        } else {
                            setResponse()
                        }
                    })

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

        if (inJSON.CTA !== undefined) {

            checkPorts()

        } else {
            res.end()
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});