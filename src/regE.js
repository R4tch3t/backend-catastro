const mysql = require('mysql');
const base64 = require('base64topdf');
const fs = require('fs');
const path = require('path');

const registrarE = (servers, servCount, port, hostname) => (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
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
    //servers[servCount].maxConnections = 1
    //const servCount = servers.length-1
    setResponse = () => {
        outJSON = JSON.stringify(outJSON);
        res.end(`${outJSON}`);
        con.destroy();
        servers[servCount].close();
        servers[servCount].listen(port, hostname);
        //bands[servCount] = false
    }

    insertEscritura = () => {

        if (inJSON.dateUp === '') {
            sql = `INSERT INTO ordenes${inJSON.tp} (CTA,m1,m2,tc,zona,bg,periodo,total,idEmpleado,otroservicio) VALUES `
            sql += `(${inJSON.CTA},'${inJSON.m1}','${inJSON.m2}',`
            sql += `'${inJSON.tc}','${inJSON.zona}','${inJSON.bg}',`
            sql += `'${inJSON.periodo}','${inJSON.total}','${inJSON.idEmpleado}','${inJSON.otroservicio}')`;
        } else {
            sql = `INSERT INTO ordenes${inJSON.tp} (CTA,m1,m2,tc,zona,bg,periodo,total,idEmpleado,otroservicio,dateUp) VALUES `
            sql += `(${inJSON.CTA},'${inJSON.m1}','${inJSON.m2}',`
            sql += `'${inJSON.tc}','${inJSON.zona}','${inJSON.bg}',`
            sql += `'${inJSON.periodo}','${inJSON.total}','${inJSON.idEmpleado}','${inJSON.otroservicio}','${inJSON.dateUp}')`;
        }
        con.query(sql, (err, result, fields) => {
            if (!err) {
                sql = `SELECT * FROM ordenes${inJSON.tp} WHERE CTA=${inJSON.CTA} AND periodo='${inJSON.periodo}' ORDER by idOrden DESC`
                con.query(sql, (err, result, fields) => {
                    let c = 0;
                    outJSON.idOrden = result[0].idOrden
                    outJSON.dateUp = result[0].dateUp
                    sql = `INSERT INTO folios(idOrden, tp) VALUES (${outJSON.idOrden},'${inJSON.tp}')`
                    con.query(sql, (err, result) => {
                        outJSON.folio = result.insertId
                        if (inJSON.idImpuestos.length === 0) {
                            outJSON.exito = 0
                            setResponse()
                        }
                        inJSON.idImpuestos.forEach(element => {
                            sql = `INSERT INTO predial${inJSON.tp} (idOrden,idImpuesto,val) VALUES `
                            sql += `(${outJSON.idOrden},'${element.id}',`
                            sql += `'${element.val}')`
                            con.query(sql, (err, result, fields) => {
                                if (!err) {
                                    //INSERT NEW ORDEN
                                    c++;
                                    if (inJSON.idImpuestos.length === c) {
                                        outJSON.exito = 0
                                        setResponse()
                                    }

                                }
                            });

                        });

                    })

                })
            }
            console.log(err)
        });
    }

    spellToNumber = (txt) => {
        return txt.replace("DIECISEIS","16")
    }

registrar = () => {
    try {
        con.connect((err) => {
            outJSON = {};
            outJSON.error = {};
            if (err) {
                console.log(`Error: ${err}`);
                setResponse()
            } else {
                if (pdf64[inJSON.CTA] === undefined) {
                    pdf64[inJSON.CTA] = inJSON.dataPart

                } else {
                    pdf64[inJSON.CTA] += inJSON.dataPart
                }
                // console.log(`pdf64`)
                // console.log(inJSON.count)
                if (inJSON.count < inJSON.lengthE) {
                    outJSON.next = 1
                    setResponse();
                } else {
                    inJSON.CTA = parseInt(inJSON.CTA)
                    pdf64[inJSON.CTA] = pdf64[inJSON.CTA].split('base64,')[1]
                        //  console.log(`fin ${pdf64}`)
                    if (pdf64[inJSON.CTA]) {
                        let subPath = "escrituras/" + inJSON.tp + "/" + inJSON.CTA
                            // console.log(subPath)
                        if (!fs.existsSync(path.join(__dirname, subPath))) {
                            fs.mkdirSync(path.join(__dirname, subPath), { recursive: true })
                                /*fs.mkdir(path.join(__dirname, subPath), (err) => { 
                                if (err) { 
                                    return console.error(err); 
                                } 
                                console.log('Directory created successfully!'); 
                                subPath += "/"+inJSON.fileName
                                //subPath = "src/"+subPath
                                subPath = path.join(__dirname, subPath)
                                console.log(`subPath ${subPath}`)
                                let decodedBase64 = base64.base64Decode(pdf64, subPath);
                                });*/
                        } //else{
                        subPath += "/" + inJSON.fileName
                        subPath = path.join(__dirname, subPath)
                        let decodedBase64 = base64.base64Decode(pdf64[inJSON.CTA], subPath);
                        var PDFImage = require("pdf-image").PDFImage;
                        //const url = require('url');
                        //subPath = url.pathToFileURL(subPath);
                        //subPath=subPath.split(" ").join("20%")
                       // subPath="'"+subPath+"'"
                      //  console.log(subPath)
                        var pdfImage = new PDFImage(subPath);
                        pdfImage.convertPage(3).then(async (imagePath) => {
                            // 0-th page (first page) of the slide.pdf is available as slide-0.
                            const vision = require('@google-cloud/vision');
                                                        // Creates a client
                            const client = new vision.ImageAnnotatorClient();

                            // const fileName = 'Local image file, e.g. /path/to/image.png';

                            // Performs text detection on the local file
                            const [result] = await client.documentTextDetection(imagePath);
                            const detections = result.textAnnotations;
                            //console.log('Text:');
                            let txt = ""
                            let prevLit = ""
                            detections.forEach(text => {
                                //txt+=text.description.slice(0,text.description.length-3)+" "
                                txt=text.description
                                
                                if(txt==="="&&(prevLit==="S"||prevLit==="s")){
                                     outJSON.S = txt
                                }
                                if(txt.includes("m²")){
                                    outJSON.S = prevLit
                                }
                                prevLit = txt
                              //  console.log(txt)
                            });

                            let sql = `UPDATE padron${inJSON.tp} SET escriturasPath='${inJSON.fileName}'`
                            sql += ` WHERE CTA=${inJSON.CTA}`
                                //console.log(sql)
                            con.query(sql, (err, result, fields) => {

                                /*if (result.length !== 0) {
                                sql = `UPDATE padron${inJSON.tp} SET escriturasPath='${inJSON.fileName}'`
                                //sql += `m1='${inJSON.m1}', m2='${inJSON.m2}', tc='${inJSON.tc}', `
                                sql += ` WHERE CTA=${inJSON.CTA}`
                                }*/
                                outJSON.next = 0
                               // txt = txt.slice(0,txt.length-3)
                                outJSON.next = 0
                                pdf64[inJSON.CTA] = '';
                                currentCTA = undefined;
                                setResponse();
                            });
                        }).catch(e=>{
                            console.log(e)
                        });
                            //const url = require('url');
                            //imagePath = imagePath.split("\\");
                            //imagePath = imagePath[imagePath.length-1];
                            //imagePath = `http://localhost:2999/escrituras/${inJSON.tp}/${inJSON.tp}/${inJSON.CTA}/${}`
/*
                              // read binary data
                                var bitmap = fs.readFileSync(imagePath);
                                
                                // convert binary data to base64 encoded string
                                let base64 =`data:image/jpeg;base64,${Buffer(bitmap).toString('base64')}`;
                            
                            const bodyJSON = {
                                src: base64,
                                "formats": ["text"],
                                "alphabets_allowed": {
                                    "hi": false,
                                    "zh": false,
                                    "ja": false, 
                                    "ko": false,
                                    "ru": false,
                                    "th": false
                                    },
                                data_options: {
                                include_asciimath: false,
                                include_latex: false,
                                },
                            };
                         ///   console.log(bodyJSON)
                            const request = require('request')

                                request.post(
                                'https://api.mathpix.com/v3/text',
                                {
                                    method: 'POST',
                                    headers: {
                                        Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                        app_id: 'bebetovictor_gmail_com_624c02',
                                        app_key: '95cbf36020ce3e06f9a9',
                                        },
                                    body: JSON.stringify(bodyJSON),
                                },
                                (error, res, body) => {
                                    if (error) {
                                    console.error(error)
                                    return
                                    }
                                    console.log(`statusCode: ${res.statusCode}`)
                                    body=JSON.parse(body);
                                    console.log(body.text)
                                }
                            )
                            
                        }).catch(e=>{
                            console.log(e)
                        });
                        */
                        /*let pdf_extract = require('pdf-ocr');
                       
                        
                        var inspect = require('eyes').inspector({maxLength:20000});
                    // var absolute_path_to_pdf = '~/Downloads/sample.pdf'
                        let options = {
                            type: 'ocr' // perform ocr to get the text within the scanned image
                        }

                        var processor = pdf_extract(subPath, options, function(err) {
                            if (err) {
                                return callback(err);
                            }
                            });
                            processor.on('complete', function(data) {
                              //  inspect(data.text_pages, 'extracted text pages');
                                console.log('extracted text pages')
                                console.log(data)
                         //       callback(null, text_pages);
                            });
                            processor.on('error', function(err) {
                              //  inspect(err, 'error while extracting pages');
                                console.log('error')
                                console.log(err)
                           //     return callback(err);
                            });
                            processor.on('page', (data) => {
                                console.log('page')
                                console.log(data)
                            });
                        //}*/

                    }
                    


                }

                /*let sql = `SELECT * FROM padron${inJSON.tp} WHERE CTA=${inJSON.CTA}`
con.query(sql, (err, result, fields) => {
if (result.length !== 0) {
    sql = `UPDATE padron${inJSON.tp} SET contribuyente='${inJSON.nombre}', ubicacion='${inJSON.calle}', `
    sql += `m1='${inJSON.m1}', m2='${inJSON.m2}', tc='${inJSON.tc}', `
    sql += `zona='${inJSON.zona}', bg='${inJSON.bg}', periodo='${inJSON.periodo}' WHERE CTA=${inJSON.CTA}`
}
});*/
            }

        });
    } catch (e) {
        console.log(e)
    }
}
        //servers[servers.length - 1].maxConnections=1
    req.setEncoding('utf8');

    req.on('data', (chunk) => {
        inJSON += chunk;
    }).on('end', async() => {

        try {
            inJSON = JSON.parse(inJSON);
            // var base64Data = inJSON.base64.replace(/^data:image\/jpg;base64,/, "");
            outJSON.error.name = 'none';
            outJSON.error.name2 = 'none';

        } catch (e) {
            //console.clear()
            console.log(`error: ${e}`);

            outJSON.error.name = `${e}`;
        }

        if (inJSON.CTA !== undefined) {
            //console.log(inJSON.CTA)
            //console.log(port)
            //if (servers[servers.length - 1].connections < 2) {
            //bands[servCount] = true
            //new Promise((resolve,reject)=>{
            //  console.log(con.state)
            if (currentCTA === undefined || currentCTA === inJSON.CTA) {
                currentCTA = inJSON.CTA
                registrar()
            } else if (currentCTA !== inJSON.CTA) {
                outJSON.nextNode = 1
                outJSON.currentCTA = currentCTA
                setResponse();
            }
            console.log(currentCTA[inJSON.CTA])
                //resolve(1)
                //})
                /*}else{
                  let out2JSON = {reload: true};
                  out2JSON = JSON.stringify(out2JSON);
                  console.log(`out2JSON: ${out2JSON}`)
                  res.end(`${out2JSON}`);
                  
                  servers.push(http.createServer(registrarO));

                  servers[servers.length-1].listen(ports, hostname, async () => {
                    console.log(`Server running at http://${hostname}:${ports}/`);
                    /*const sendUri = `http://localhost:${ports}/`;
                    const response = await fetch(sendUri, {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify(bodyJSON)
                    });

                  });
                }*/
        } else {
            res.end()
        }
    });
}
exports.regE = registrarE