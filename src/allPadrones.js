const http = require('http');
const hostname = '0.0.0.0';
const port = 3023;
const mysql = require('mysql');

const server = http.createServer((req, res) => {
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
}
padronR = (subqueryB) => {
const sql = `SELECT * FROM padronr p ${subqueryB} ORDER by p.CTA ASC`
con.query(sql, (err, result, fields) => {
      if (!err) {
        if (result.length > 0) {
          outJSON.contribuyenter = result
        }
      }
      setResponse()
})    
}

padronU = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        let subqueryB = ''
        //var subqueryN = ''
        if (inJSON.CTAnombre !== '') {
          if (inJSON.tipoB != undefined && inJSON.tipoB === 0) {
              subqueryB = `WHERE p.CTA=${inJSON.CTAnombre}`
          }
          if (inJSON.tipoB != undefined && inJSON.tipoB === 1) {
            subqueryB = `WHERE p.contribuyente LIKE '%${inJSON.CTAnombre}%'`
          }
        }
        let sql = `SELECT * FROM padronu p ${subqueryB} ORDER by p.CTA ASC`
        console.log(sql)
        con.query(sql, (err, result, fields) => {
          
          if (!err) {
            if (result.length > 0) {
              
              outJSON.contribuyenteu = result
              
             
             /* sql = `SELECT * FROM ubipredio${inJSON.tp} u `
              sql += `WHERE u.CTA=${result[0].CTA} ORDER by u.CTA DESC`
              //console.log(sql)
              con.query(sql, (err, result, fields) => {
                
                if (!err) {
                  if (result.length > 0) {
                    outJSON.ubicacion = result
                    sql = `SELECT * FROM ordenes${inJSON.tp} o `
                    sql += `WHERE o.CTA=${result[0].CTA} ORDER by o.idOrden DESC`
                    con.query(sql, (err, result, fields) => {
                      if (!err) {
                        if (result.length > 0) {
                          outJSON.orden = result[0]
                          sql = `SELECT * FROM predial${inJSON.tp} p `
                          sql += `WHERE p.idOrden=${result[0].idOrden} ORDER by p.idImpuesto ASC`
                          con.query(sql, (err, result, fields) => {
                              if (!err) {
                                if (result.length > 0) {
                                  outJSON.predial = result
                                }
                              }
                              setResponse()
                          });

                        }else{
                          //setResponse()
                        }
                      }
                      setResponse()
                    });
                  } else {
                    outJSON.ubicacion = [{
                      calle: '', numero: 0, colonia: '', cp: 0, municipio: '', localidad: '', basegrav: 0
                    }]
                    setResponse()
                  }
                } else {

                }
                
              });*/
            } else {
              outJSON.error.name = 'error01'
            }
          } else {

          }
          padronR(subqueryB)
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
          console.log(`error: ${e}`);
          outJSON.error.name = `${e}`;
      }
      
      if (inJSON.CTAnombre!=undefined) {
        padronU()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
