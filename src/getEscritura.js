const http = require('http');
const hostname = '0.0.0.0';
const port = 2998;
const mysql = require('mysql');

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    let inJSON = '';
    var outJSON = {};
    outJSON.error = {};
    var con = mysql.createConnection({
        host: "localhost",
        user: process.env.NODE_MYSQL_USER,
        password: process.env.NODE_MYSQL_PASS,
        database: "dbcatastro"
    });

    setResponse = () => {
        outJSON = JSON.stringify(outJSON);
        res.end(`${outJSON}`);
        con.destroy();
        server.close();
        server.listen(port, hostname);
    }

    getEscritura = () => {

        con.connect((err) => {
            outJSON = {};
            outJSON.error = {};
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                var sql = `SELEC * FROM padron${inJSON.tp} WHERE CTA=${inJSON.CTA}`
                con.query(sql, (err, result, fields) => {
                    if (!err) {

                        outJSON = result
                        setResponse()

                    } else {
                        console.log(`error: ${err}`)
                    }
                });

                console.log("Connected!");

            }
        });

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
            // console.clear()
            console.log(`error: ${e}`);
            outJSON.error.name = `${e}`;
        }

        if (inJSON.CTA !== undefined) {

            getEscritura()

        } else {
            res.end()
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});