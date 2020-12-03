var fs = require('fs');
var https = require('https');
var express = require('express');
const PORT = 2998;
const path = require('path');
let options = null
try {
    options = {
        key: fs.readFileSync(path.join(__dirname, "cert/server.key")),
        cert: fs.readFileSync(path.join(__dirname, "cert/server.cer"))
    }
} catch (e) {
       https = require('http');
    console.log(e)
} finally {

let app = express();
function setResponseHeaders(res, filename) {
    res.header('Content-disposition', 'inline; filename=' + filename);
    res.header('Content-type', 'application/pdf');
}
https.createServer(options, app).listen(PORT, function(){
    console.log("My https server listening on port " + PORT + "...");
});
app.get('/expedientes/:tp/:CTA/:escritura', function(req, res){
    try {
        var filename = "/var/expedientes/" + req.params.tp + "/" + req.params.CTA
        filename += "/" + req.params.escritura
            //filename = path.join(__dirname, filename)
            // console.log(filename)
            // file = tmpdir + filename;
        setResponseHeaders(res, req.params.escritura);
        //fs.createReadStream(path.join(__dirname, filename)).pipe(res);
        if(fs.existsSync(filename)){
            fs.createReadStream(filename).pipe(res);
        }
        /*
        //To Create in the fly pdf
        (async function() {
            const instance = await phantom.create();
            const page = await instance.createPage();

            await page.property('viewportSize', { width: 1024, height: 600 });
            const status = await page.open(path.join(__dirname, filename));
            console.log(`Page opened with status [${status}].`);
            console.log(path.join(__dirname, filename))
            await page.render(req.params.escritura);
            console.log(`File created at [./stackoverflow.pdf]`);
            fs.createReadStream(path.join(__dirname, filename)).pipe(res);
            await instance.exit();
        })();*/

    } catch (e) {
        console.log(e)
    }
});

}