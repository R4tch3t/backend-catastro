const http = require('http'); const hostname = '0.0.0.0'; let port = 3061;const mysql = require('mysql');currentCTA = undefined;pdf64 = {};const servers = [];let bands = [false];const regE = require('../regE');servers.push(http.createServer(regE.regE(servers, servers.length, port, hostname)));servers[servers.length - 1].maxConnections = 1;servers[servers.length - 1].listen(port, hostname, () => {console.log('Server running at http://'+hostname+':'+port+'/');});
