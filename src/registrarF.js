let http = require('https');
const hostname = '0.0.0.0';
const port = 3027;
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

insertForma = () => {
    sql = `INSERT INTO ordenes (nombre,tp,total,idEmpleado) VALUES `
    sql += `('${inJSON.nombre}', '${inJSON.tp}',`
    sql += `'${inJSON.total}','${inJSON.idEmpleado}')`
    con.query(sql, (err, result, fields) => {
      if (!err) { 
          const idOrden = result.insertId
          sql = `SELECT * FROM ordenes WHERE idOrden=${idOrden} ORDER by idOrden DESC`
          con.query(sql, (err, result, fields) => {
            let c = 0;
            outJSON.idOrden = result[0].idOrden
            outJSON.dateUp = result[0].dateUp
            sql = `INSERT INTO folios(idOrden, tp) VALUES (${outJSON.idOrden},'${inJSON.tp}')`
            con.query(sql, (err, result) => {
              outJSON.folio = result.insertId
              if (inJSON.idImpuestos.length === 0) {
                outJSON.exito = 0
                setResponse()
              }
              inJSON.idImpuestos.forEach(element => {
                sql = `INSERT INTO formas (idOrden,idImpuesto,val) VALUES `
                sql += `(${outJSON.idOrden},'${element.id}',`
                sql += `'${element.val}')`
                con.query(sql, (err, result, fields) => {
                  if (!err) {
                    //INSERT NEW ORDEN
                    c++;
                    if(inJSON.idImpuestos.length===c){
                      outJSON.exito = 0
                      setResponse()
                    }
                          
                  }
                });

              });

            })

          })
      }
  });
}

outFolio=()=>{
outJSON.idOrden = inJSON.idOrden
outJSON.dateUp = inJSON.dateUp
sql = `SELECT * FROM folios WHERE idOrden=${inJSON.idOrden} AND tp='f'`
con.query(sql, (err, result, fields) => {
  if (result.length > 0) {
    outJSON.folio = result[0].idFolio
  }
  outJSON.exito = 0
  setResponse()
})
}

registrar = () => {
  try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        let sql = `SELECT * FROM ordenes WHERE idOrden=${inJSON.idOrden} ORDER by idOrden DESC`
        
        con.query(sql, (err, result, fields) => {
          if(result.length===0){
            insertForma()
          }else{
            sql = `UPDATE ordenes SET nombre='${inJSON.nombre}',total='${inJSON.total}',dateUp='${inJSON.dateUp}' `
            sql += `WHERE idOrden=${inJSON.idOrden} `
            con.query(sql, (err, result, fields) => {
              let c = 0;
              if (inJSON.removI.length === 0) {
                  inJSON.removI = [{id: -1}]
              }
              inJSON.removI.forEach(e => {
                sql = `DELETE FROM formas `
                sql += `WHERE idOrden=${inJSON.idOrden} AND idImpuesto=${e.id} `
                con.query(sql, (err, result, fields) => {
                  c++
                  if (inJSON.removI.length === c) {
                    let c = 0;
                    if (inJSON.idImpuestos.length === 0) {
                      outFolio()
                    }
                    inJSON.idImpuestos.forEach(element => {
                      sql = `SELECT * FROM formas `
                      sql += `WHERE idOrden=${inJSON.idOrden} AND idImpuesto=${element.id} `
                      con.query(sql, (err, result, fields) => {
                        if(result.length===0){
                          sql = `INSERT INTO formas (idOrden,idImpuesto,val) VALUES `
                          sql += `(${inJSON.idOrden},'${element.id}',`
                          sql += `'${element.val}')`
                          con.query(sql, (err, result, fields) => {
                            if (!err) {
                              c++;
                              if (inJSON.idImpuestos.length === c) {
                                outFolio()
                              }

                            }
                          });

                        }else{

                          sql = `UPDATE formas SET val='${element.val}' WHERE `
                          sql += `idOrden=${inJSON.idOrden} AND idImpuesto='${element.id}'`
                          con.query(sql, (err, result, fields) => {
                            if (!err) {
                              //INSERT NEW ORDEN
                              c++;
                              if (inJSON.idImpuestos.length === c) {
                                outFolio()
                              }

                            }
                          });

                        }
                      })
                      


                    });

                  }
                })
              })
            })
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

      if (inJSON.nombre !== undefined) {
        
          registrar()
        
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
