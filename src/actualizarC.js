const http = require('http');
const hostname = '0.0.0.0';
const port = 3026;
const mysql = require('mysql');
//const Pdf = require('../renderPDF');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin' : '*',
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
}

actualizar = () => {
  try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        let sql = `UPDATE padron${inJSON.tp} SET contribuyente=${inJSON.nombre} WHERE CTA=${inJSON.CTA}`
        con.query(sql, (err, result, fields) => {

            if (!err) {
              if(result.length!==0){
                /*
                sql = `INSERT INTO padron${inJSON.tp}(CTA, contribuyente, ubicacion, basegrav, observaciones) `
                sql += `VALUES (${inJSON.CTA},'${inJSON.nombre}','',0,'')`
                con.query(sql, (err, result, fields) => {
                  if (!err) {
                    outJSON.contribuyente = result
                    sql = `INSERT INTO ubipredio${inJSON.tp}(CTA, calle, lote, manzana, numero, colonia, cp, municipio, localidad) `
                    sql += `VALUES (${inJSON.CTA},'${inJSON.calle}','${inJSON.lote}','${inJSON.manzana}', `
                    sql += `'${inJSON.numCalle}','${inJSON.colonia}','${inJSON.cp}', '${inJSON.municipio}', '${inJSON.localidad}')`
                    
                    con.query(sql, (err, result, fields) => {
                          if (!err) {
                            setResponse()
                          }
                    })
                  }
                  
                });*/
              }else{
                outJSON.error.name = "error01"
                
              }

            }else{
              outJSON.error.name = "error03"
              //setResponse()
            }
            setResponse()

        })
        console.log("Connected!");

      }
    });
  }catch(e){
    console.log(e)
  }
 }

  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    inJSON += chunk;
  }).on('end', () => {
    
    try{
      inJSON = JSON.parse(inJSON);
     // var base64Data = inJSON.base64.replace(/^data:image\/jpg;base64,/, "");
      outJSON.error.name='none';
      outJSON.error.name2='none';
    
      } catch (e) {
          console.log(`error: ${e}`);
          outJSON.error.name = `${e}`;
      }

      if (inJSON.CTA !== undefined) {

        actualizar()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
