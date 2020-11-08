#!/bin/bash
str="";
portC="3031"
i="0"
mkdir src/upPdf

while [ $i -lt 64 ]
do
str="const http = require('http');

const hostname = '0.0.0.0';
let port = $portC;"
str+="const mysql = require('mysql');"
str+="currentCTA = undefined;"
str+="pdf64 = {};"
str+="const servers = [];"
str+="let bands = [false];"
str+="const regE = require('../regE');"
str+="servers.push(http.createServer(regE.regE(servers, servers.length, port, hostname)));" 
str+="servers[servers.length - 1].maxConnections = 1;" 
str+="servers[servers.length - 1].listen(port, hostname, () => {"
str+="console.log('Server running at http://'+hostname+':'+port+'/');"
str+="});"
echo $str > "src/upPdf/registrarE$i.js"
i=$[$i+1]
portC=$[$portC+1]
done

