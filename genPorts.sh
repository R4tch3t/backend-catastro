#!/bin/bash
str="";
portC="3031"
i="0"
mkdir src/upPdf

while [ $i -lt 128 ]
do
str="let http = require('https');

const hostname = '0.0.0.0';
let port = $portC;"
str+="const mysql = require('mysql');"
str+="currentCTA = undefined;"
str+="const servers = [];"
str+="let bands = [false];"
str+="const regE = require('../regE');"
str+="const fs = require('fs');"
str+="const path = require('path');"
str+="let options = null;"
str+="try{"
str+="options = {"
str+="key: fs.readFileSync(path.join(__dirname, 'cert/server.key')),"
str+="cert: fs.readFileSync(path.join(__dirname, 'cert/server.cer'))"
str+="};"
str+="}catch(e){"
str+="http=require('http');"
str+="console.log(e);"
str+="}"
str+="servers.push(http.createServer(options,regE.regE(servers, servers.length, port, hostname)));" 
str+="servers[servers.length - 1].maxConnections = 1024;" 
str+="servers[servers.length - 1].listen(port, hostname, () => {"
str+="console.log('Server running at http://'+hostname+':'+port+'/');"
str+="});"
echo $str > "src/upPdf/registrarE$i.js"
i=$[$i+1]
portC=$[$portC+1]
done

