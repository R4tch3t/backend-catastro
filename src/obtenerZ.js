let http = require('https');
const hostname = '0.0.0.0';
const port = 3020;
const mysql = require('mysql');
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

obtenerZ = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {        
        let sql = `SELECT * FROM zonac WHERE calle LIKE '%${inJSON.street}%' AND colonia LIKE '%${inJSON.barr}%' `
        //sql += `(o.dateUp>='${inJSON.fi}' AND o.dateUp<='${inJSON.ff}') `
        //sql += `AND pa.CTA=o.CTA AND u.CTA=o.CTA`
        con.query(sql, (err, result, fields) => {
          if (!err) {
            if(result.length>0){
              outJSON.zona = result
              
            }else{
              outJSON.error.name='error01';
              outJSON.ordenes = [];
            }
            setResponse()
          }else{

          }
        });

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

      if (inJSON.street!== undefined) {

        obtenerZ()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
