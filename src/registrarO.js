let http = require('https');
const hostname = '0.0.0.0';
const port = 3016;
//const { resolve } = require('path');
const servers = []
let bands = [false]
let ports = 3040
const regO = require('./regO');
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

servers.push(http.createServer(options,regO.regO(servers, 0, port, hostname)));
servers[servers.length - 1].maxConnections = 1
servers[0].listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
/*while (servers.length<5){
  const portC = ports
  bands.push(false)
  servers.push(http.createServer(regO.regO(servers, servers.length, ports, hostname)));
  servers[servers.length - 1].maxConnections = 1
  servers[servers.length-1].listen(ports, hostname, () => {
    console.log(`Server running ats http://${hostname}:${portC}/`);
  });
  ports++
}*/