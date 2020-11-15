let http = require('https');
const hostname = '0.0.0.0';
const port = 3030;
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
//const ExcelJS = require('exceljs');
// polyfills required by exceljs
require('core-js/modules/es.promise');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('regenerator-runtime/runtime');

// ...

const ExcelJS = require('exceljs/dist/es5');

const server = http.createServer(options,(req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  let inJSON = '';
  let outJSON = {};
  let wc = 1;
  let tp = "u";
  let f = 2;
  let tF = 3803;
  let bandW = false;
  const Y = new Date().getFullYear()
  outJSON.error = {};
  let con = mysql.createConnection({
        host: "localhost",
        user: process.env.NODE_MYSQL_USER,
        password: process.env.NODE_MYSQL_PASS,
        database: "dbcatastro"
  });
  let inCount = 0
  let workbook = null
  let worksheet = null
 // console.log(`${res.host} : ${res.statusCode}`);
sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

setResponse = () => {
  outJSON = JSON.stringify(outJSON);
  res.end(`${outJSON}`);
  con.destroy();
  server.close();
  server.listen(port, hostname);
}
getTf = () => {
  const worksheet2 = workbook._worksheets[wc]
  worksheet2.eachRow({
      includeEmpty: true
    },
     (row, rowNumber) => {
      tF = rowNumber
    });
}
endQuerys = () => {  
  if (f === tF) {
    if (tp==="u"){
      tp = "r";
      //wc=2;
      f=2;
      wc++
      worksheet = workbook._worksheets[wc]
      getTf()
      
      bandW = false;
    } else if (tp === "r") {
      tp = "f";
      //wc = 7;
      f = 2;
      wc++
      worksheet = workbook._worksheets[wc]
      getTf()
      //tF = 33;
      bandW = false;
    }else{
      setResponse()
    }
  }else{
    f++;
    bandW = false
  }
  console.log(`endQuery: ${f} ${bandW}`)
}

insertOrden = (CTA, tp, m1, m2, tc, zona, bg, periodo, total, otroservicio, idImpuestos, dateUp) => {

  if (dateUp === '') {
    sql = `INSERT INTO ordenes${tp} (CTA,m1,m2,tc,zona,bg,periodo,total,idEmpleado,otroservicio) VALUES `
    sql += `(${CTA},'${m1}','${m2}',`
    sql += `'${tc}','${zona}','${bg}',`
    sql += `'${periodo}','${total}','1915','${otroservicio}')`;
  } else {
    sql = `INSERT INTO ordenes${tp} (CTA,m1,m2,tc,zona,bg,periodo,total,idEmpleado,otroservicio,dateUp) VALUES `
    sql += `(${CTA},'${m1}','${m2}',`
    sql += `'${tc}','${zona}','${bg}',`
    sql += `'${periodo}','${total}','1915','${otroservicio}','${dateUp}')`;
  }

  con.query(sql, (err, result, fields) => {
    if (!err) {
      sql = `SELECT * FROM ordenes${tp} WHERE CTA=${CTA} AND periodo='${periodo}' ORDER by idOrden DESC`
      con.query(sql, (err, result, fields) => {
        let c = 0;
        const idOrden = result[0].idOrden
        //outJSON.dateUp = result[0].dateUp
        sql = `INSERT INTO folios(idOrden, tp) VALUES (${idOrden},'${tp}')`
        con.query(sql, (err, result) => {
          //outJSON.folio = result.insertId
          if (idImpuestos.length === 0) {
            outJSON.exito = 0
            endQuerys();
          }
          idImpuestos.forEach(element => {
            sql = `INSERT INTO predial${tp} (idOrden,idImpuesto,val) VALUES `
            sql += `(${idOrden},'${element.id}',`
            sql += `'${element.val}')`
            con.query(sql, (err, result, fields) => {
              if (!err) {
                //INSERT NEW ORDEN
                c++;
                if (idImpuestos.length === c) {
                  outJSON.exito = 0
                  endQuerys();
                }

              }
            });

          });

        })

      })
    }
  });
  
}

registrarO = (nombre, CTA, tp, calle, lote, manzana, numero, colonia, cp, municipio, localidad, total, bg, periodo, otroservicio, idImpuestos, dateUp) => {
  let sql = `SELECT * FROM ubipredio${tp} WHERE CTA=${CTA}`
  //console.log(sql);
  con.query(sql, (err, result, fields) => {

    if (!err) {
      if (result.length === 0) {
        sql = `UPDATE padron${tp} SET contribuyente='${nombre}'`;
        sql += ` WHERE CTA=${CTA}`;
        con.query(sql, (err, result, fields) => {
          sql = `INSERT INTO ubipredio${tp} (CTA,calle,lote,manzana,numero,colonia,cp,municipio,localidad) VALUES `
          sql += `(${CTA},'${calle}','${lote}',`
          sql += `'${manzana}','${numero}','${colonia}',`
          sql += `'${cp}','${municipio}',`;
          sql += `'${localidad}')`;

          con.query(sql, (err, result, fields) => {

            if (!err) {

              insertOrden(CTA, tp, 0, 0, 0, 0, bg, periodo, total, otroservicio, idImpuestos, dateUp)

            }
          });
        });
      } else {

        sql = `UPDATE ubipredio${tp} SET calle='${calle}', lote='${lote}', `
        sql += `manzana='${manzana}', numero='${numero}', colonia='${colonia}', `
        sql += `cp='${cp}', municipio='${municipio}', `;
        sql += `localidad='${localidad}' WHERE CTA=${CTA}`;
        con.query(sql, (err, result, fields) => {

          sql = `SELECT * FROM ordenes${tp} WHERE CTA=${CTA} AND periodo LIKE '%${periodo}' ORDER by idOrden DESC`
          //console.log(sql)
          con.query(sql, (err, result, fields) => {
            if (!err) {
              if (result.length === 0) {
                insertOrden(CTA, tp, 0, 0, 0, 0, bg, periodo, total, otroservicio, idImpuestos, dateUp)

              } else {
                let idOrden = result[0].idOrden
                outJSON.idOrden = idOrden
                outJSON.dateUp = dateUp
                sql = `SELECT * FROM folios WHERE idOrden=${idOrden} AND tp='${tp}'`
                con.query(sql, (err, result, fields) => {
                  outJSON.folio = result[0].idFolio
                  sql = `UPDATE ordenes${tp} SET m1='${0}', m2='${0}', tc='${0}', `
                  sql += `zona='${0}', bg='${bg}', total='${total}', periodo='${periodo}', `
                  sql += `otroservicio='${otroservicio}', dateUp='${dateUp}' WHERE idOrden=${idOrden}`
                  const removI = []
                  con.query(sql, (err, result, fields) => {
                    if (!err) {
                      let c = 0;
                      if (removI.length === 0) {
                        removI.push({id: -1});
                      }
                      removI.forEach(e => {
                        sql = `DELETE FROM predial${tp} `
                        sql += `WHERE idOrden=${idOrden} AND idImpuesto=${e.id} `
                        con.query(sql, (err, result, fields) => {

                          if (!err) {
                            c++;
                            if (removI.length === c) {
                              c = 0;
                              if (idImpuestos.length === 0) {
                                outJSON.exito = 0
                                endQuerys();
                              }
                              idImpuestos.forEach(element => {
                                sql = `UPDATE predial${tp} SET val='${element.val}' `
                                sql += `WHERE idOrden=${idOrden} AND idImpuesto=${element.id} `
                                con.query(sql, (err, result, fields) => {
                                  if (!err) {

                                    if (result.affectedRows > 0) {
                                      c++;
                                      if (idImpuestos.length === c) {
                                        outJSON.exito = 0
                                        endQuerys();
                                      }
                                    } else {
                                      sql = `INSERT INTO predial${tp} (idOrden,idImpuesto,val) VALUES `
                                      sql += `(${idOrden},'${element.id}',`
                                      sql += `'${element.val}')`
                                      con.query(sql, (err, result, fields) => {
                                        if (!err) {
                                          c++;
                                          if (idImpuestos.length === c) {
                                            outJSON.exito = 0
                                            endQuerys();
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

                })
              }

            }
          });
        });
      }

    } else {
      //outJSON.error.name = "error03"
      //setResponse()
      console.log(err)
    }

  })
  
}

insertForma = (nombre, tp, total, idImpuestos, dateUp) => {
  sql = `INSERT INTO ordenes (nombre,tp,total,idEmpleado, dateUp) VALUES `
  sql += `('${nombre}', '${tp}',`
  sql += `'${total}','1915', '${dateUp}')`
  con.query(sql, (err, result, fields) => {
    if (!err) {
      const idOrden = result.insertId
      sql = `SELECT * FROM ordenes WHERE idOrden=${idOrden} ORDER by idOrden DESC`
      con.query(sql, (err, result, fields) => {
        let c = 0;
        outJSON.idOrden = result[0].idOrden
        outJSON.dateUp = result[0].dateUp
        sql = `INSERT INTO folios(idOrden, tp) VALUES (${outJSON.idOrden},'${tp}')`
        con.query(sql, (err, result) => {
          outJSON.folio = result.insertId
          if (idImpuestos.length === 0) {
            outJSON.exito = 0
            endQuerys();
          }
          idImpuestos.forEach(element => {
            sql = `INSERT INTO formas (idOrden,idImpuesto,val) VALUES `
            sql += `(${outJSON.idOrden},'${element.id}',`
            sql += `'${element.val}')`
            con.query(sql, (err, result, fields) => {
              if (!err) {
                //INSERT NEW ORDEN
                c++;
                if (idImpuestos.length === c) {
                  outJSON.exito = 0
                  endQuerys();
                }

              }
            });

          });

        })

      })
    }
  });
}

readEx = async () => {
    try{
    con.connect((err) => {
      console.log('readEx')
      console.log(ExcelJS)
      workbook = new ExcelJS.Workbook();
      workbook.xlsx.readFile(`${__dirname}/FebreroCatastro.xlsx`)
        .then(async function () {
          
          // use workbook
          console.log('read done')
          console.log(workbook._worksheets.length)
          let worksheet2 = workbook._worksheets[1]
          worksheet = workbook._worksheets[wc]
          console.log(`worksheet2: ${worksheet2.getCell(`A0`).rowCount }`)
          worksheet2.eachRow({
            includeEmpty: true
          },
          function (row, rowNumber) {
            tF = rowNumber
            //console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
          });

          //let worksheet = workbook._worksheets[wc]
          //console.log(`worksheetleng: ${workbook._worksheets[1].}`)
          while(f<(tF+1)){
            
            await sleep(50)
            let nombre = worksheet.getCell(`A${f}`).value
            if(!bandW&&tp!=="f"){
              bandW=true
              nombre = nombre === null ? "" : nombre 
              let calle = worksheet.getCell(`B${f}`).value
              calle = calle === null ? "" : calle
              let colonia = worksheet.getCell(`C${f}`).value
              colonia = colonia === null ? "" : colonia
              let num = worksheet.getCell(`D${f}`).value
              num = num === null ? "" : num
              let mza = worksheet.getCell(`E${f}`).value
              mza = mza === null ? "" : mza
              let lote = worksheet.getCell(`F${f}`).value
              lote = lote === null ? "" : lote
              const cta = worksheet.getCell(`G${f}`).value
              const idImpuestos = []
              const V0020401 = worksheet.getCell(`H${f}`).value
              const V0020801 = worksheet.getCell(`M${f}`).value
              const V0020802 = worksheet.getCell(`L${f}`).value
              const V0020803 = worksheet.getCell(`N${f}`).value
              const V0090701 = worksheet.getCell(`O${f}`).value
              const V0030101 = worksheet.getCell(`P${f}`).value
              const V0090702 = worksheet.getCell(`Q${f}`).value
              const V0090704 = worksheet.getCell(`R${f}`).value
              const V0070201 = worksheet.getCell(`I${f}`).value
              const V0070202 = worksheet.getCell(`J${f}`).value
              const V0070203 = worksheet.getCell(`K${f}`).value
              const V0090101 = worksheet.getCell(`S${f}`).value
              const total = worksheet.getCell(`T${f}`).value.result;
              const bg = worksheet.getCell(`U${f}`).value
              //let periodo = worksheet.getCell(`R${f}`).value.toString().split("-")
              let periodo = worksheet.getCell(`V${f}`).value
              /*if(periodo.length>1){
                periodo=periodo[1]
              }else{
                periodo=periodo[0]
              }*/
              //console.log(periodo)
              //const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
              let dateUp = new Date(worksheet.getCell(`W${f}`).value).setUTCHours(9);
              dateUp = new Date(dateUp).toISOString().slice(0, -1);
              //let dateUp = new Date(worksheet.getCell(`S${f}`).value).toISOString();
              const I0020401 = tp === "u" ? 1 : 3
              if (V0020401 !== 0) {
                idImpuestos.push({id: I0020401, val: V0020401});
              }
              if (V0020801 !== 0) {
                idImpuestos.push({id: 4, val: V0020801});
              }
              if (V0020802 !== 0) {
                idImpuestos.push({id: 5, val: V0020802});
              }
              if (V0020803 !== 0) {
                idImpuestos.push({id: 6, val: V0020803});
              }
              if (V0030101 !== 0) {
                idImpuestos.push({ id: 8, val: V0030101 });
              }
              if (V0070201!==0){
                idImpuestos.push({id: 10, val: V0070201});
              }
              if (V0070202!==0){
                idImpuestos.push({id: 11, val: V0070202});
              }
              if (V0070203!==0) {
                idImpuestos.push({id: 12, val: V0070203});
              }
              if (V0090101 !== 0) {
                idImpuestos.push({id: 13, val: V0090101});
              }
              if (V0090701 !== 0) {
                idImpuestos.push({ id: 16, val: V0090701 });
              }
              if (V0090702 !== 0) {
                idImpuestos.push({ id: 17, val: V0090702 });
              }
              if (V0090704 !== 0) {
                idImpuestos.push({ id: 19, val: V0090704 });
              }
             // console.log(idImpuestos);
             // console.log(`cta: ${cta}`);
             // console.log(`dateUp: ${dateUp}`);
             // console.log(`nombre: ${nombre}`);
             // console.log(`periodo: ${periodo}`);
              //console.log(total);
              //console.log(worksheet.getCell(`A${f}`).value)
              registrarO(nombre, cta, tp, calle, lote, mza, num, colonia, 41100, 'CHILAPA DE ÁLVAREZ', 'CHILAPA DE ÁLVAREZ', total, bg, periodo, "", idImpuestos, dateUp)
            } else if (!bandW && tp === "f") {
              bandW = true
              //nombre =  === null ? "" : nombre
              if (worksheet.getCell(`E${f}`).value) {
                const total = worksheet.getCell(`D${f}`).value;
                const idImpuestos = []
                const V0010804 = worksheet.getCell(`C${f}`).value;
                idImpuestos.push({id: 22, val: V0010804});
                let dateUp = new Date(worksheet.getCell(`E${f}`).value).setUTCHours(9);
                dateUp = new Date(dateUp).toISOString().slice(0, -1);
                //console.log(idImpuestos);
                //console.log(`cta: ${cta}`);
               // console.log(`dateUp2: ${tF}`);
               // console.log(`nombre2: ${worksheet.getCell(`E${f}`).value}`);
                insertForma(nombre, 'f', total, idImpuestos, dateUp);
              }else{
                f++;
              }
            }
          }
          
        });
        //setResponse()
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
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

      if (inJSON.exStr!==undefined) {

        readEx()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

server.timeout = 1000;
