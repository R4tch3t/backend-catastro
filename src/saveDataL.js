const http = require('http');
const hostname = '0.0.0.0';
const port = 3021;
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
  outJSON.exito = 1
  outJSON = JSON.stringify(outJSON);
  res.end(`${outJSON}`);
  con.destroy();
  server.close();
  server.listen(port, hostname);
}
insertPT = () =>{
  let i = 0
  let sql = `DELETE FROM pt${inJSON.tp} WHERE CTA=${inJSON.CTA}`
  con.query(sql, (err, result, fields) => {
        if (!err) {
          if (inJSON.pt.length === i) {
            insertLoca()
          }
          inJSON.pt.forEach(e => {
            sql = `INSERT INTO pt${inJSON.tp}(CTA, latT, lngT) VALUES `
            sql += `(${inJSON.CTA},'${e.lat}','${e.lng}')`
            console.log(sql)
            con.query(sql, (err, result, fields) => {
              if (!err) {
                i++;
                if (inJSON.pt.length === i) {
                  insertLoca()
                }
              } else {
                outJSON.error.name = 'error04';
              }
              // setResponse()
            });

          });
        }
  })
  
}
insertLoca = () => {
  let i = 0
  let sql = `DELETE FROM loca${inJSON.tp} WHERE CTA=${inJSON.CTA}`
  con.query(sql, (err, result, fields) => {
        if (!err) {
          if (inJSON.mInfo.length === i) {
            setResponse()
          }
          inJSON.mInfo.forEach(e => {
            sql = `INSERT INTO loca${inJSON.tp}(CTA, lat, lng) VALUES `
            sql += `(${inJSON.CTA},'${e.lat}','${e.lng}')`
            console.log(sql)
            con.query(sql, (err, result, fields) => {
              if (!err) {
                i++;
                if (inJSON.mInfo.length === i) {
                  setResponse()
                }
              } else {
                outJSON.error.name = 'error05';
              }
              // setResponse()
            });

          });

        }
  })
  
}
saveData = () => {
    try{
    con.connect((err) => {
      outJSON = {};
      outJSON.error = {};
      if (err) {
        console.log(`Error: ${err}`);
      } else {   

        if(inJSON.saveZone===1){   
        const sql = `INSERT INTO zonac(calle, colonia, valor) VALUES ('${inJSON.street}','${inJSON.barr}','${inJSON.zona}')`
        console.log(sql)
        con.query(sql, (err, result, fields) => {
          if (!err) {
            
          }else{
            outJSON.error.name = 'error01';
          }
        });
      }
      //setResponse()
      
      let i = 0;
      let sql=`DELETE FROM pc${inJSON.tp} WHERE CTA=${inJSON.CTA}`
      con.query(sql, (err, result, fields) => {
          if (!err) {
            if (inJSON.pc.length === i) {
              insertPT()
            }
            inJSON.pc.forEach(e => {
              sql = `INSERT INTO pc${inJSON.tp}(CTA, latC, lngC) VALUES `
              sql += `(${inJSON.CTA},'${e.lat}','${e.lng}')`
              console.log(sql)
              con.query(sql, (err, result, fields) => {
                if (!err) {
                  i++;
                  if (inJSON.pc.length===i){
                    insertPT()
                  }
                } else {
                  outJSON.error.name = 'error02';
                }
               // setResponse()
              });

            });

          } else {
            outJSON.error.name = 'error03';
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
          //console.clear()
          console.log(`error: ${e}`);
          outJSON.error.name = `${e}`;
      }

      if (inJSON.street!== undefined) {

        saveData()
        
      }else{
        res.end()
      }
  });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
