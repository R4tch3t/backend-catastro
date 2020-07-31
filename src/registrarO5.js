const http = require('http');
const hostname = '0.0.0.0';
const port = 3043;
const mysql = require('mysql');

//const { resolve } = require('path');
const servers = []
let bands = [false]
let ports = 3040
//const Pdf = require('../renderPDF');
const regO = require('./regO');

//servers.push(http.createServer(registrarO(0,port)));
servers.push(http.createServer(regO.regO(servers, 0, port, hostname)));
servers[servers.length - 1].maxConnections = 1
servers[0].listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
/*while (servers.length<5){
  const portC = ports
  bands.push(false)
  servers.push(http.createServer(registrarO(servers.length, ports)));
  servers[servers.length - 1].maxConnections = 1
  servers[servers.length-1].listen(ports, hostname, () => {
    console.log(`Server running ats http://${hostname}:${portC}/`);
  });
  ports++
}*/