const http = require('http');
const hostname = '0.0.0.0';
const port = 3014;
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

setResponse = () => {
  outJSON = JSON.stringify(outJSON);
  res.end(`${outJSON}`);
}

obtenerQ = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        var subquery = ''
        if (inJSON.idQuincena !== '' && inJSON.idQuincena !== undefined) {
          subquery = `AND dq.idQuincena=${inJSON.idQuincena}`
        }

        var sql = `SELECT * FROM quincenas q, descuentos_quincenas dq WHERE dq.idEmpleado=${inJSON.idUsuario} AND q.idQuincena=dq.idQuincena  ORDER BY dq.idQuincena ASC`
        con.query(sql, (err, result, fields) => {
          if (!err) {
            if(result.length>0){
              outJSON.quincenas = result
              sql = `SELECT * FROM descuentos_quincenas dq, quincenas q WHERE dq.idEmpleado=${inJSON.idUsuario} ${subquery} AND q.idQuincena = dq.idQuincena`
              con.query(sql, (err, result, fields) => {
                if (!err) {
                  if (result.length > 0) {
                    outJSON.data = result
                  } else {
                    outJSON.error.name = 'error01'
                  }
                  setResponse()
                } else {

                }
              });
            }else{
              outJSON.error.name='error01'
            }
          }else{

          }
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

      if (inJSON.idUsuario !== undefined) {

        obtenerQ()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
