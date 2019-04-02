const fs       = require('fs'), //for file system management
      cote = require('cote'), //for enabling Microservice architecture components
      app = require('express'),
      server = app(),
      bodyParser = require('body-parser'),
      cors = require('cors');
      

require('../models')

const serviceRequester = new cote.Requester(
    { name: 'screenshot request' }); //send request to ecosystem, expecting for Responder if not will queue it until one is available, if there are multiple load balancing

/** setting up server for api */
server.use(bodyParser.json()); // to support json-encoded bodies
server.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
server.use(cors());

/**
 * screenshot endpoint
 */
server.post('/api/screenshot', function(req, resObj){
    var data = req.body;
    var targetDirectory = data.targetDirectory;
    var username = data.username
    var links = data.links;
    var fileName = data.fileName;
    console.log("request recieved to /api/screenshot endpoint");

    processScreenshotRequest(targetDirectory, username, links, fileName, resObj);

});



function processScreenshotRequest(targetDirectory, username, webLinks, fileName, resObj){

  
    if(fileName){ //if filename provided as option to read website urls
        if (!fs.existsSync(fileName)) {
            console.log('the given file is not accesible, please validate the existence of the file');
            resObj.status(200).json({
                message: {"status":"fail","message": fileName + " file is not accesible, please validate the existence of the file" }
            });
            return;
        }
        fs.readFile(fileName, 'utf8', function(err, data){
            if(err){
                console.log('Could not read the file, please validate the data inside the file');
                resObj.status(200).json({
                    message: {"status":"fail","message": fileName + " Could not be read, please validate the data inside the file" }
                });
                return
            }
            console.log(`OK ${fileName}`);
            var links = data.replace(/(\r\n|\n|\r|\s)/gm, ""); //remove all the occurences of line breaks and spaces
            links = links.split(";");
            console.log(links)
            const userData = {
                "links": links,
                "userID": username
            }
            requestSenderScreenshot(userData, targetDirectory, resObj);
            
        })
    }
    else if(webLinks){
        var links = webLinks.split(";")
        console.log(links)
        const userData = {
            "links": links,
            "userID": username
        }
        
        requestSenderScreenshot(userData, targetDirectory, resObj);      
       
    }
    else if(targetDirectory){ //if target directory is given to download the images
        console.log(targetDirectory)
        if (!fs.existsSync(targetDirectory)) {
            console.log('path is not correct, try again');
            resObj.status(200).json({
                message: {"status":"fail","message": targetDirectory + " path is not correct, try again" }
            });
            return
        }
        serviceRequester.send({type: "getImages", data:{username:username, targetDirectory: targetDirectory}}, (res) => {
            console.log("images achieved back");
            console.log(res);
            resObj.status(200).json({
                message: {"status":"success","message": " images are downloaded to " + targetDirectory}
            });
            return;
        })

    }
}

/**
 * Sender Microservice for screenshot request
 */
function requestSenderScreenshot(userData, targetDirectory, resObj){

    serviceRequester.send({type: "screenshot", data:userData}, (res) => {
        console.log(res);
        if(targetDirectory){ // if target directory set then download images also when screenshot requested
            serviceRequester.send({type: "getImages", data:{username:userData.userID, targetDirectory: targetDirectory}}, (res) => {
                console.log("images achieved back");
                console.log(res);
                resObj.status(200).json({
                    message: {"status":"success","message": "directory " + res.location}
                });
            })
        }
        else{
            console.log("final directory unknown")
            resObj.status(200).json({
                message: {"status":"partial", "message": "directoryUnknown"}
            });
        }
    })
}

server.listen(5000);

