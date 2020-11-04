const http = require('http');
const hostname = '0.0.0.0';
let port = 3031;
const mysql = require('mysql');

//const { resolve } = require('path');
const servers = []
let bands = [false]
let ports = 3035
const regE = [];
let c = 0
currentCTA = {}
pdf64 = {}
while(port<ports){
  regE.push(require('./regE'))
  const portL = port 
  servers.push(http.createServer(regE[c].regE(servers, servers.length, portL, hostname)));
  servers[servers.length - 1].maxConnections = 8
  servers[servers.length - 1].listen(portL, hostname, () => {
    console.log(`Server running at http://${hostname}:${portL}/`);
  });
  port++
  c++
}
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