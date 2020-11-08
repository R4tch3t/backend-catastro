let http = require('https');
const hostname = '0.0.0.0';
const port = 3029;
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
  let outJSON = {};
  outJSON.error = {};
  let con = mysql.createConnection({
        host: "localhost",
        user: process.env.NODE_MYSQL_USER,
        password: process.env.NODE_MYSQL_PASS,
        database: "dbcatastro"
  });
  let bandF = false

 // console.log(`${res.host} : ${res.statusCode}`);
setResponse = () => {
  outJSON = JSON.stringify(outJSON);
  res.end(`${outJSON}`);
  con.destroy();
  server.close();
  server.listen(port, hostname);
  
}

folio = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      bandF = inJSON.bandF
      inJSON.idFolio = parseInt(inJSON.idFolio)
      //console.log(bandF)
      if (err) {
        console.log(`Error: ${err}`);
      } else {

        sql = `INSERT INTO folios(idFolio, idOrden, tp) VALUES (${inJSON.idFolio},${inJSON.idOrden},'${inJSON.tp}')`
        con.query(sql, (err, result) => {
          if(!err){
            if(result !== undefined){
              outJSON.idFolio = result.insertId
            }
            setResponse()
          }else{
            outJSON.idFolio = inJSON.idFolio
            if (err.errno === 1062 /*&& !bandF*/) {
              sql = `SELECT * FROM folios WHERE idFolio=${inJSON.idFolio}`
             // console.log(sql)
              con.query(sql, (err, result, fields) => {
                if (!err) {
                  if(result.length>0){
                    console.log(result)
                    if (result[0].idOrden !== inJSON.idOrden) {
                      //console.log(result.idOrden)
                      //console.log(inJSON.idOrden)
                      inJSON.idFolio+=1
                      con.destroy();
                      con = mysql.createConnection({
                        host: "localhost",
                        user: process.env.NODE_MYSQL_USER,
                        password: process.env.NODE_MYSQL_PASS,
                        database: "dbcatastro"
                      });
                      //server.close();
                      //server.listen(port, hostname);                      
                      folio()
                    }else{
                      setResponse()
                    }
                  }else{
                    setResponse()
                  }
                }else{
                  setResponse()
                }
              })

            }else{
              setResponse()
            }
          }
          //console.log(err)
          //console.log(err.)
          
        })

      }
    });
    }catch(e){
      //console.log(e)
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
          //console.log(`error: ${e}`);
          outJSON.error.name = `${e}`;
      }

      if (inJSON.idFolio!==undefined) {

        folio()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
