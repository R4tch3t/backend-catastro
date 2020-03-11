const http = require('http');
const hostname = '0.0.0.0';
const port = 3011;
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

registrar = () => {
  try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        /*
        var sql = `SELECT * FROM empleados WHERE CVE_ID=${inJSON.idUsuario}`
        con.query(sql, (err, result, fields) => {
            if (!err) {
              if(result.length>0){
                */
                  let sql = `SELECT * FROM usuarios WHERE idUsuario=${inJSON.idUsuario}`
                  con.query(sql, (err, result, fields) => {
                    if (!err) {
                      
                      if (result[0]) {
                        outJSON.error.name = 'error01';
                        setResponse()
                      } else {
                        sql = `INSERT INTO usuarios (idUsuario,nombre,correo,edad,avatar64,pass,idRol) VALUES `
                        sql += `(${inJSON.idUsuario},'${inJSON.nombre}',`
                        sql += `'${inJSON.correo}',${inJSON.edad},`
                        sql += `${inJSON.avatar64},${inJSON.pass},`;
                        sql += `${inJSON.idRol})`;
                        con.query(sql, function (err, result) {
                          if (err) {
                            console.log(`Error en la consulta: ${err}`);
                          } else {

                            sql = `SELECT * FROM usuarios WHERE idUsuario=${inJSON.idUsuario}`
                            con.query(sql, (err, result, fields) => {
                                if (!err) {
                                  outJSON = result
                                  setResponse()
                                }
                            })
                            console.log("1 record inserted");
                          }

                        });
                      }
                    }
                  });
                  /*
              }else{
                outJSON.error.name="error02"
                setResponse()
              }
            }else{
              outJSON.error.name = "error03"
              setResponse()
            }
        })*/
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

      if (inJSON.correo !== undefined) {

        registrar()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
