let http = require('https'); const hostname = '0.0.0.0'; let port = 3830;const mysql = require('mysql');currentCTA = undefined;const servers = [];let bands = [false];const regE = require('../regE');const fs = require('fs');const path = require('path');let options = null;try{options = {key: fs.readFileSync(path.join(__dirname, 'cert/server.key')),cert: fs.readFileSync(path.join(__dirname, 'cert/server.cer'))};}catch(e){http=require('http');console.log(e);}servers.push(http.createServer(options,regE.regE(servers, servers.length, port, hostname)));servers[servers.length - 1].maxConnections = 128;servers[servers.length - 1].listen(port, hostname, () => {console.log('Server running at http://'+hostname+':'+port+'/');});
