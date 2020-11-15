let http = require('https');
const hostname = '0.0.0.0';
const port = 3024;
const mysql = require('mysql');
//const Pdf = require('../renderPDF');
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

const server = http.createServer(options,(req, res) => {
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
  con.destroy();
  server.close();
  server.listen(port, hostname);
}

registrar = () => {
  try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        let sql = `SELECT * FROM padron${inJSON.tp} WHERE CTA=${inJSON.CTA}`
        con.query(sql, (err, result, fields) => {

            if (!err) {
              if(result.length===0){
                sql = `INSERT INTO padron${inJSON.tp}(CTA, contribuyente, ubicacion, m1, m2, tc, zona, bg, observaciones, periodo) `
                sql += `VALUES (${inJSON.CTA},'${inJSON.nombre}','',${inJSON.m1},${inJSON.m2},${inJSON.tc},${inJSON.zona},${inJSON.bg},`
                sql += `'','${inJSON.periodo}')`
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
                  
                });
              }else{
                outJSON.error.name = "error01"
                setResponse()
              }

            }else{
              outJSON.error.name = "error03"
              setResponse()
            }
            

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
          //console.clear()
          console.log(`error: ${e}`);
          outJSON.error.name = `${e}`;
      }

      if (inJSON.CTA !== undefined) {

        registrar()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
