let http = require('https'); const hostname = '0.0.0.0'; let port = 3047;const mysql = require('mysql');currentCTA = undefined;pdf64 = {};const servers = [];let bands = [false];const regE = require('../regE');const fs = require('fs');let options = null;try{options = {key: fs.readFileSync('/opt/lampp/etc/ssl.key/server.key'),cert: fs.readFileSync('/opt/lampp/etc/ssl.crt/server.cer')};}catch(e){http=require('http');console.log(e);}servers.push(http.createServer(options,regE.regE(servers, servers.length, port, hostname)));servers[servers.length - 1].maxConnections = 1;servers[servers.length - 1].listen(port, hostname, () => {console.log('Server running at http://'+hostname+':'+port+'/');});
