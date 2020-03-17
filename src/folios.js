const http = require('http');
const hostname = '0.0.0.0';
const port = 3028;
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
  con.destroy();
  server.close();
  server.listen(port, hostname);
  
}

getSubDataNoCTA=(result,idOrden)=>{
  outJSON.ubicacion = [{
    calle: '', lote: 0, manzana:'', numero: 0, colonia: '', cp: 0, municipio: '', localidad: '', basegrav: 0
  }]
    outJSON.orden = result
    sql = `SELECT * FROM formas f `
    sql += `WHERE f.idOrden=${idOrden} ORDER by f.idForma DESC`
    con.query(sql, (err, result, fields) => {
          if (result.length > 0) {
            outJSON.formas = result
          }
    setResponse()
        })
}

getSubData=(tp,idOrden)=>{
  let sql = `SELECT * FROM ordenes${tp} o `
  sql += `WHERE o.idOrden=${idOrden} ORDER by o.idOrden DESC`
  con.query(sql, (err, result, fields) => {
    if (!err) {
      if (result.length > 0) {
        outJSON.orden = result[0]
        sql = `SELECT * FROM padron${tp} p WHERE p.CTA=${outJSON.orden.CTA} ORDER by p.CTA DESC`
        con.query(sql, (err, result, fields) => {
              if (!err) {
                if (result.length > 0) {
                  outJSON.contribuyente = result
                  sql = `SELECT * FROM ubipredio${tp} u `
                  sql += `WHERE u.CTA=${result[0].CTA} ORDER by u.CTA DESC`
                  //console.log(sql)
                  con.query(sql, (err, result, fields) => {

                        if (!err) {
                          if (result.length > 0) {
                            outJSON.ubicacion = result
                          }else {
                            outJSON.ubicacion = [{
                              calle: '', lote: 0, manzana:'', numero: 0, colonia: '', cp: 0, municipio: '', localidad: '', basegrav: 0
                            }]
                          }
                          setResponse()
                        }
                  })        
                }
              }
            })
      } else {
        setResponse()
      }
    }
  });
  
}

folio = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        let sql = `SELECT * FROM folios f WHERE f.idFolio=${inJSON.idFolio} ORDER by f.idOrden DESC`
        con.query(sql, (err, result, fields) => {
          if(result.length>0){
           outJSON.folio = result[0]
           const tp = result[0].tp
           const idOrden = result[0].idOrden
           sql = `SELECT * FROM ordenes o `
           sql += `WHERE o.idOrden=${idOrden} AND o.tp='${tp}' ORDER by o.idOrden DESC`
           con.query(sql, (err, result, fields) => {
             if(result.length>0){
                getSubDataNoCTA(result,idOrden)
             }else{
                getSubData(tp,idOrden)
             }
           })
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
