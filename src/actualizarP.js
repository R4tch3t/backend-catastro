const http = require('http');
const hostname = '0.0.0.0';
const port = 3017;
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
        database: "dbsegsistema"
  });

 // console.log(`${res.host} : ${res.statusCode}`);
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
        var sql = `SELECT * FROM empleados WHERE CVE_ID=${inJSON.idUsuario}`
        con.query(sql, (err, result, fields) => {
            if (!err) {
              if(result.length>0){
                  var sql = `SELECT * FROM usuarios WHERE idUsuario=${inJSON.idUsuario}`
                  
                  con.query(sql, (err, result, fields) => {
                    if (!err) {
                      
                      if (result[0] !== undefined && `${result[0].idUsuario}` === `${inJSON.idUsuario}`) {
                        sql = `UPDATE usuarios SET pass='${inJSON.pass}'`;
                        /*if (`${inJSON.pass}`!==`${""}`){
                          sql += `, pass='${inJSON.pass}'`
                        }*/
                        sql += ` WHERE idUsuario=${inJSON.idUsuario}`
                        //sql += `idRol=${inJSON.idRol}, `
                        con.query(sql, function (err, result) {
                          if (err) {
                            console.log(`Error en la consulta: ${err}`);
                          } else {

                            var sql = `SELECT * FROM usuarios WHERE idUsuario=${inJSON.idUsuario}`
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
              }else{
                outJSON.error.name="error01"
                setResponse()
              }
            }else{
              outJSON.error.name = "error01"
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

      if (inJSON.idUsuario !== undefined) {

        registrar()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
