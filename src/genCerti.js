let http = require('https');
const hostname = '0.0.0.0';
const port = 2977;
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
  let bandF = false

 // console.log(`${res.host} : ${res.statusCode}`);
setResponse = () => {
  outJSON = JSON.stringify(outJSON);
  res.end(`${outJSON}`);
  con.destroy();
  server.close();
  server.listen(port, hostname);
  
}

getFolio = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      //bandF = inJSON.bandF
      //inJSON.idFolio = parseInt(inJSON.idFolio)
      //console.log(bandF)
      if (err) {
        console.log(`Error: ${err}`);
      } else {

             const sql = `SELECT * FROM certificados WHERE CTA='${inJSON.CTA}' ORDER BY idCertificado DESC`
              con.query(sql, (err, result, fields) => {
                if (!err) {
                  if(result.length>0){
                    let f = result[0].idCertificado+"";
                    //let n = 0
                    while(f.length<4){
                      f = "0"+f
                    }
                    
                    outJSON.folio=f
                    setResponse()   
                  }else{
                    outJSON.new=1
                    outJSON.lastFolio=1
                    let f = "1";
                    const sql = `SELECT * FROM certificados ORDER BY idCertificado DESC`

                    con.query(sql, (err, result, fields) => {
                      
                      if(result.length>0){
                       // outJSON.lastFolio=result[0].idCertificado;
                       f = (result[0].idCertificado+1)+"";
                      
                      }
                      while(f.length<4){
                        f = "0"+f
                      }
                      outJSON.lastFolio=f
                      setResponse()
                    });
                  }
                }else{
                  setResponse()
                }
              })

          

      }
    });
    }catch(e){
      console.log(e)
    }

 }

 genFolio = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      //bandF = inJSON.bandF
      //inJSON.idFolio = parseInt(inJSON.idFolio)
      //console.log(bandF)
      if (err) {
        console.log(`Error: ${err}`);
      } else {

        sql = `INSERT INTO certificados(CTA) VALUES ('${inJSON.CTA}')`
        con.query(sql, (err, result) => {
          if(!err){
            if(result !== undefined){
              outJSON.folio = result.insertId
            }
            setResponse()
          }else{
            
              setResponse()
            
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

      if (inJSON.CTA!==undefined) {
        switch(inJSON.op){
          case 0:
            getFolio();          
            break;
          case 1:
            genFolio();
            break;
          default: break;
        }
        
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


