const http = require('http');
const hostname = '0.0.0.0';
const port = 3016;
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

registrar = () => {
  try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        let sql = `SELECT * FROM ubipredio${inJSON.tp} WHERE CTA=${inJSON.CTA}`
        con.query(sql, (err, result, fields) => {

            if (!err) {
              if(result.length===0){
                  sql = `INSERT INTO ubipredio${inJSON.tp} (CTA,calle,numero,colonia,cp,municipio,localidad) VALUES `
                  sql += `(${inJSON.CTA},'${inJSON.calle}',`
                  sql += `'${inJSON.numero}','${inJSON.colonia}',`
                  sql += `'${inJSON.cp}','${inJSON.municipio}',`;
                  sql += `'${inJSON.localidad}')`;
                  con.query(sql, (err, result, fields) => {
                    if (!err) {
                  
                      sql = `INSERT INTO ordenes${inJSON.tp} (CTA,m1,m2,zona,bg,periodo,total) VALUES `
                      sql += `(${inJSON.CTA},${inJSON.m1},`
                      sql += `${inJSON.m2},'${inJSON.zona}',${inJSON.bg},`
                      sql += `'${inJSON.periodo}',${inJSON.total})`;
                      con.query(sql, (err, result, fields) => {
                        if (!err) { 
                            sql = `SELECT * FROM ordenes${inJSON.tp} WHERE CTA=${inJSON.CTA} AND periodo='${inJSON.periodo}' ORDER by idOrden DESC`
                            con.query(sql, (err, result, fields) => {

                              let c = 0;
                              inJSON.idImpuestos.forEach(element => {
                                sql = `INSERT INTO predial${inJSON.tp} (idOrden,idImpuesto,val) VALUES `
                                sql += `(${result[0].idOrden},'${element.id}',`
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
                        }
                    });
                    }
                  });
              }else{
                sql = `UPDATE ubipredio${inJSON.tp} SET calle='${inJSON.calle}', `
                sql += `numero='${inJSON.numero}', colonia='${inJSON.colonia}', `
                sql += `cp='${inJSON.cp}', municipio='${inJSON.municipio}', `;
                sql += `localidad='${inJSON.localidad}' WHERE CTA=${inJSON.CTA}`;
                con.query(sql, (err, result, fields) => {  
                    sql = `SELECT * FROM ordenes${inJSON.tp} WHERE CTA=${inJSON.CTA} AND periodo='${inJSON.periodo}' ORDER by idOrden DESC`
                    con.query(sql, (err, result, fields) => {
                      if (!err) {
                        if(result.length===0){
                          setResponse();
                          /*let c = 0;
                          inJSON.idImpuestos.forEach(element => {
                            sql = `INSERT INTO predial${inJSON.tp} (idOrden,idImpuesto,val) VALUES `
                            sql += `(${result[0].idOrden},'${element.id}',`
                            sql += `'${element.val}')`
                            con.query(sql, (err, result, fields) => {
                              if (!err) {
                                //INSERT NEW ORDEN
                                c++;
                                if (inJSON.idImpuestos.length === c) {
                                  outJSON.exito = 0
                                  setResponse()
                                }

                              }
                            });
                          });*/ 

                        }else{
                          let idOrden = result[0].idOrden
                          sql = `UPDATE ordenes${inJSON.tp} SET m1=${inJSON.m1}, m2=${inJSON.m2}, zona='${inJSON.zona}', `
                          sql += `bg=${inJSON.bg} WHERE idOrden=${idOrden}`
                          con.query(sql, (err, result, fields) => {
                            if (!err) {

                              let c = 0;
                              if (inJSON.removI.length === 0) {
                                inJSON.removI = [{id: -1}]
                              }
                              inJSON.removI.forEach(e => {
                                sql = `DELETE FROM predial${inJSON.tp} `
                                sql += `WHERE idOrden=${idOrden} AND idImpuesto=${e.id} `
                                con.query(sql, (err, result, fields) => {
                                  
                                  if (!err) {
                                    c++;
                                    if (inJSON.removI.length === c) {                                          
                                      c = 0;
                                      if (inJSON.idImpuestos.length === 0) {
                                        outJSON.exito = 0
                                        setResponse()
                                      }
                                      inJSON.idImpuestos.forEach(element => {
                                        sql = `UPDATE predial${inJSON.tp} SET val=${element.val} `
                                        sql += `WHERE idOrden=${idOrden} AND idImpuesto=${element.id} `
                                        con.query(sql, (err, result, fields) => {
                                          if (!err) {
                                            
                                            if (result.affectedRows>0){
                                              c++;
                                              if (inJSON.idImpuestos.length === c) {
                                                outJSON.exito = 0
                                                setResponse()
                                              }
                                            }else{
                                              sql = `INSERT INTO predial${inJSON.tp} (idOrden,idImpuesto,val) VALUES `
                                              sql += `(${idOrden},'${element.id}',`
                                              sql += `'${element.val}')`
                                              con.query(sql, (err, result, fields) => {
                                                if (!err) {
                                                  c++;
                                                  if (inJSON.idImpuestos.length === c) {
                                                    outJSON.exito = 0
                                                    setResponse()
                                                  }

                                                }
                                              });
                                            }
                                          }
                                        });
                                      });
                                    } 
                                    }
                                });
                              });      
                            }

                            });
                            
                        }
                        
                      }
                    });
                });
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
