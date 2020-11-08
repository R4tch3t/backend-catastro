let http = require('https');
const hostname = '0.0.0.0';
const port = 3014;
const mysql = require('mysql');
 const fs = require('fs');
let options = null
try{
options = {
    key: fs.readFileSync('/opt/lampp/etc/ssl.key/server.key'),
    cert: fs.readFileSync('/opt/lampp/etc/ssl.crt/server.cer')
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

obtenerOF = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {        
        let sql = `SELECT * FROM ordenesu o, padronu pa, ubiprediou u WHERE `
        sql += `(o.dateUp>='${inJSON.fi}' AND o.dateUp<='${inJSON.ff}') `
        sql += `AND pa.CTA=o.CTA AND u.CTA=o.CTA ORDER by o.dateUp ASC`
        
        con.query(sql, (err, result, fields) => {
          if (!err) {
            if(result.length>0){
              outJSON.ordenesu = result
              //setResponse()
              
            }else{
              outJSON.error.name='error01';
              outJSON.ordenesu = []
            } 
            sql = `SELECT * FROM ordenesr o, padronr pa, ubipredior u WHERE `
            sql += `(o.dateUp>='${inJSON.fi}' AND o.dateUp<='${inJSON.ff}') `
            sql += `AND pa.CTA=o.CTA AND u.CTA=o.CTA ORDER by o.dateUp ASC`
          
            con.query(sql, (err, result, fields) => {
              if (!err) {
                if (result.length > 0) {
                  outJSON.ordenesr = result
                  /*result.forEach(e => {
                    outJSON.ordenes.push(e)
                  })*/
                  //setResponse()

                } else {
                  outJSON.error.name = 'error02';
                  outJSON.ordenesr = []
                }
                
              } else {
              }
              setResponse()
            });
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
         // console.clear()
          console.log(`error: ${e}`);
          outJSON.error.name = `${e}`;
      }

      if (inJSON.fi!== undefined) {
        obtenerOF()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
