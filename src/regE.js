const mysql = require('mysql');
const base64 = require('base64topdf');
const fs = require('fs');
pdf64 = {}
pdf64.stackAna={}
lengthP = {}
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
    
   //  const imagePaths = async ()=>{ return (await pdfImage.convertFile()) }
   // let npage = 0
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
    promiseAna = (subPath)=>{ return new Promise((resolve,reject)=>{
       // imagePaths.bandAna[inJSON.CTA]=true

        renderPages(subPath)
        resolve(1)
    })}
    analice = () => {
        let subPath = "/var/expedientes/" + inJSON.tp + "/" + inJSON.CTA
        subPath += "/" + inJSON.fileName
        // subPath = path.join(__dirname, subPath)
        //if(!imagePaths.bandAna[inJSON.CTA]){
        promiseAna(subPath).then((v)=>{
        //    console.log(v)
        });
        /*}else{
            outJSON.analising=1
            outJSON.p=(inJSON.npage/15*100)+" % "
            console.log(outJSON)
            setResponse();
        }*/
        
    }
    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    getLength=async (pdfImage)=>{
         let bandL = true
         let bandL2 = false
         pdf64.stackAna[inJSON.CTA] = []
       //  console.log('getLength')
         while(bandL){
        try{
            await sleep(133)
            if(!bandL2){
                bandL2=true
            pdfImage.convertPage(lengthP[inJSON.CTA]).then((imagePath) => {
                pdf64.stackAna[inJSON.CTA].push(imagePath);
              //  console.log(imagePath)
                lengthP[inJSON.CTA]++;
                bandL2=false
            }).catch(e=>{
                //console.log(e)
               // console.log(pdf64.stackAna[inJSON.CTA])
                bandL2=false
                bandL=false    
            })
            }
            
           
        }catch(e){
            //console.log(e)
            //console.log(lengthP)
            //console.log(pdf64.stackAna[inJSON.CTA])
            bandL=false
          //  return lengthP
        }
    }
        
    }
    renderPages = async (subPath) => {
        var PDFImage = require("pdf-image").PDFImage;
        //const url = require('url');
        //subPath = url.pathToFileURL(subPath);
        //subPath=subPath.split(" ").join("20%")
        // subPath="'"+subPath+"'"
        //  console.log(subPath)
        var pdfImage = new PDFImage(subPath);
       // console.log("inJSON.npage")
       // console.log(inJSON.npage)
        if(lengthP[inJSON.CTA]===undefined){
            lengthP[inJSON.CTA]=0;
            await getLength(pdfImage);
        }
        //console.log(lengthP)
     //   pdfImage.convertPage(inJSON.npage).then(async(imagePath) => {
            // 0-th page (first page) of the slide.pdf is available as slide-0.
            if(inJSON.npage<lengthP[inJSON.CTA]){
            const vision = require('@google-cloud/vision');
            // Creates a client
            const client = new vision.ImageAnnotatorClient();

            // const fileName = 'Local image file, e.g. /path/to/image.png';
            console.log(inJSON.npage)
            // Performs text detection on the local file
            const imagePath = pdf64.stackAna[inJSON.CTA][inJSON.npage]
            const [result] = await client.documentTextDetection(imagePath);
            const detections = result.textAnnotations;
            //console.log('Text:');
            let txt = ""
            let prevLit = ""
                //  console.log("detections")
                  //console.log(detections)
            outJSON.S = null
            detections.forEach(text => {
                //txt+=text.description.slice(0,text.description.length-3)+" "
                txt = text.description

                if (txt === "=" && (prevLit === "S" || prevLit === "s")) {
                    //outJSON.S = txt
                    prevLit = txt
                }
                if (txt.includes("m²")) {
                    outJSON.S = prevLit
                }
                if (txt.includes("5-")) {
                    const a = txt.split("5-")
                    if(a.length>0){ 
                        outJSON.S = a.join("")
                    }else{ 
                        outJSON.S = '0.00'
                    }
                }
                if (prevLit.includes("=")) {
                    outJSON.S = txt.replace("M2", "").replace("m2", "");
                }
                prevLit = txt
                console.log(txt)
            });
          //  console.log("outJSON.S")
            console.log(outJSON.S)
            
            if (!outJSON.S||outJSON.S === null||outJSON.S === undefined) {
                
                    console.log(lengthP[inJSON.CTA])
                    console.log(inJSON.npage)
                    inJSON.npage++;
                    outJSON.npage=inJSON.npage;
                    outJSON.lengthP=lengthP[inJSON.CTA];
                    outJSON.p=(Math.round((inJSON.npage/lengthP[inJSON.CTA]*100)*100)/100)+" %";
                    outJSON.analising=1;

               
                //outJSON.next=0;
             //   console.log("pdfImage.length")
              //  console.log(inJSON.npage)
                setResponse();
                //renderPages(subPath)
            } else {
                outJSON.S = outJSON.S.split(",").join("")
                outJSON.S = outJSON.S.split(" ").join("")
                let sql = `UPDATE padron${inJSON.tp} SET m1='${outJSON.S}'`
                sql += ` WHERE CTA=${inJSON.CTA}`
                    //console.log(sql)
                con.query(sql, (err, result, fields) => {

                    /*if (result.length !== 0) {
                    sql = `UPDATE padron${inJSON.tp} SET escriturasPath='${inJSON.fileName}'`
                    //sql += `m1='${inJSON.m1}', m2='${inJSON.m2}', tc='${inJSON.tc}', `
                    sql += ` WHERE CTA=${inJSON.CTA}`
                    }*/
                    outJSON.analize = 1
                    outJSON.p="- ANALISIS COMPLETADO - 100 %"


                    // txt = txt.slice(0,txt.length-3)
                    //  outJSON.next = 0
                    // console.log(outJSON)

                    pdf64[inJSON.CTA] = '';
                    currentCTA = undefined;
                    lengthP[inJSON.CTA]=undefined
                    setResponse();
                });
            }
             }else{
                    outJSON.analize = 1
                    outJSON.p="- ANALISIS COMPLETADO - 100 %"
                    outJSON.S='0.00'

                    pdf64[inJSON.CTA] = '';
                    currentCTA = undefined;
                    lengthP[inJSON.CTA]=undefined
                    setResponse();
                }
        /*}).catch(e => {
            console.log(e)
        });*/
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
                                let subPath = "/var/expedientes/" + inJSON.tp + "/" + inJSON.CTA
                                    // console.log(subPath)
                                if (!fs.existsSync(subPath)) {
                                    fs.mkdirSync(subPath, { recursive: true })
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
                                //subPath = path.join(__dirname, subPath)
                                let decodedBase64 = base64.base64Decode(pdf64[inJSON.CTA], subPath);

                                let sql = `UPDATE padron${inJSON.tp} SET escriturasPath='${inJSON.fileName}' `
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
                                    //  outJSON.next = 0
                                   // console.log(outJSON)

                                    pdf64[inJSON.CTA] = '';
                                    currentCTA = undefined;
                                    setResponse();
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
          //  console.log(inJSON.analize)
           // console.log(inJSON.analising)
            if (!inJSON.analize) {
                if (currentCTA === undefined || currentCTA === inJSON.CTA) {
                    currentCTA = inJSON.CTA
                    registrar()
                } else if (currentCTA !== inJSON.CTA) {
                    outJSON.nextNode = 1
                    outJSON.currentCTA = currentCTA
                    setResponse();
                }
            } else {
                analice()

            }
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