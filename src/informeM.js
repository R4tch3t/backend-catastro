const http = require('http');
const hostname = '0.0.0.0';
const port = 3025;
const mysql = require('mysql');

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
  con.destroy();
  server.close();
  server.listen(port, hostname);
}

getCounts = () => {
  con.connect((err) => {
        outJSON = {};
        outJSON.error = {};
        if (err) {
          console.log(`Error: ${err}`);
        } else {
          let sql = `SELECT * FROM ordenesu`
          //sql += ``
          con.query(sql, (err, result, fields) => {
                if (!err) {
                  outJSON.countU = result.length
                  let sql = `SELECT * FROM ordenesr`
                  //sql += ``
                  con.query(sql, (err, result, fields) => {
                        if (!err) {
                          outJSON.countR = result.length
                          informeM()
                        }
                      });
                }
              })
        }
  });
}

informeM = () => {
    try{
            
        let sql = `SELECT * FROM ordenesu o, padronu pa, predialu pr WHERE `
        sql += `(o.dateUp>='${inJSON.fi}' AND o.dateUp<='${inJSON.ff}') `
        sql += `AND pa.CTA=o.CTA AND pr.idOrden=o.idOrden ORDER by o.dateUp ASC, o.idOrden ASC`
        
        con.query(sql, (err, result, fields) => {
          if (!err) {
            if(result.length>0){
              outJSON.ordenesu = result
              
              
            }else{
              outJSON.error.name='error01';
              outJSON.ordenesu = []
            } 
            sql = `SELECT * FROM ordenesr o, padronr pa, predialr pr WHERE `
            sql += `(o.dateUp>='${inJSON.fi}' AND o.dateUp<='${inJSON.ff}') `
            sql += `AND pa.CTA=o.CTA AND pr.idOrden=o.idOrden ORDER by o.dateUp ASC, o.idOrden ASC`
          
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
              sql = `SELECT * FROM padronu`
              con.query(sql, (err, result, fields) => {
                if (!err) {
                  outJSON.lengthU = result.length
                }
                sql = `SELECT * FROM padronr`
                con.query(sql, (err, result, fields) => {
                  if (!err) {
                    outJSON.lengthR = result.length
                  }
                  if(inJSON.bandG){
                    sql = `SELECT * FROM ordenes o WHERE `
                    sql += `o.dateUp>='${inJSON.fi}' AND o.dateUp<='${inJSON.ff}'`
                    sql += ` ORDER by o.dateUp ASC, o.idOrden ASC`

                    con.query(sql, (err, result, fields) => {
                      if(!err){
                        if (result.length > 0) {
                          outJSON.ordenes = result
                         
                        } else {
                          outJSON.error.name = 'error02';
                          outJSON.ordenes = []
                        }
                      }
                      setResponse()
                    });
                  }else{
                    setResponse()
                  }
                })
              
              })
            });
          }else{

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

      if (inJSON.fi!== undefined) {
        getCounts()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
