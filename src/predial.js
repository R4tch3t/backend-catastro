let http = require('https');
const hostname = '0.0.0.0';
const port = 3022;
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

predial = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        
            let sql = `SELECT * FROM predial${inJSON.tp} p `
            sql += `WHERE p.idOrden=${inJSON.idOrden} ORDER by p.idImpuesto ASC`
            con.query(sql, (err, result, fields) => {
                if (!err) {
                  if (result.length > 0) {
                    outJSON.predial = result
                  }
                }
                sql = `SELECT * FROM loca${inJSON.tp} p `
                sql += `WHERE p.CTA=${inJSON.CTA}`
                con.query(sql, (err, result, fields) => {
                  if (!err) {
                    if (result.length > 0) {
                      outJSON.loca = result
                    }
                  }
                  sql = `SELECT * FROM pc${inJSON.tp} p `
                  sql += `WHERE p.CTA=${inJSON.CTA}`
                  con.query(sql, (err, result, fields) => {
                    if (!err) {
                      if (result.length > 0) {
                        outJSON.pc = result
                      }
                    }
                    sql = `SELECT * FROM pt${inJSON.tp} p `
                    sql += `WHERE p.CTA=${inJSON.CTA}`
                    con.query(sql, (err, result, fields) => {
                      if (!err) {
                        if (result.length > 0) {
                          outJSON.pt = result
                        }
                      }
                      setResponse()
                    });
                  });
                });
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

      if (inJSON.idOrden !== undefined) {

        predial()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
