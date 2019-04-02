const cote = require('cote'), // microservice library
      models = require('./models/screenshots-models'),
      phantomJS = require('phantom'), //library for creating browser and screenshot
      AdmZip = require('adm-zip'), //zipping library
      fs = require('fs'), //file management library
      stat = fs.statSync;

require('../models')

var page;
var webpages = [];
var instanceGlobal = ""; //to keep the instance in the session //class variable can be used too
var userObjGlobal = {}; //to keep the user object in the session //class variable can be used too
var phantomChildren = []; //phantom instances
var maxInstances = 4; //max instances of phantom instances, memory intensive so 4 is optimal
var callbackGlobal ;
var targetLocation;
var counterIterations = 0;
var maxIterations = 20; // max amount of websites per instance
var processID;



/**
 * Microservice responder for incoming requests
 */
const serviceResponder = new cote.Responder({
     name: 'screenshot responder'
});


serviceResponder.on('screenshot', (req, callback) => {
    console.log(req.data)
    initializeService(req.data);
    callbackGlobal = callback;
})



serviceResponder.on('getImages', (req, callback) => {
    console.log(req.data)
    getImages(req.data);
    callbackGlobal = callback;
})



function initializeService(data){

    userObjGlobal = data;
    webpages = data.links;
    data.links = data.links[0];

    //create Phantom instance
    if (checkPhantomStatus() == true) {
        initializePhantom(data);
    }
    return checkPhantomStatus();
}

function initializePhantom (data){
    console.log("creating phantom instance..")

    phantomJS.create([ '--ignore-ssl-errors=no', '--ssl-protocol=any', '--load-images=true'])
    .then(function(instance){
        console.log("initialized");
        counterIterations = 0;
        instanceGlobal = instance;
        processID = instance.process.pid;
        phantomChildren.push(instance.process.pid);
        console.log(phantomChildren)
        //begin the service
        takeScreenshots(instance, data);

        return true;
        
    })
    .catch(function(err){
        console.log("phantom could be not be initialized ", err);
    })
}

function takeScreenshots(instance, userObj){
    
    var link = userObj.links;
    var userID = userObj.userID;
    var dir = './app/users_data/' + userID; // to store images in file structure under username
   

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    //phantom instance is running for too long, restart it 
    if(counterIterations >= maxIterations){
        instanceGlobal.exit();
        return restartPhantomInstance();
    }

    instance.createPage()
    .then(function(pageInstance){
        page = pageInstance
        return page.open(link)
    
    }).then(function(status){
        console.log(status)
        return delay(5000).then(function () { //to let the webpage to load
            return page.property('content');
        })
    })
    .then(function(content){
        targetLocation = dir + "/image" +  new Date().toString() + ".png";
        page.render(targetLocation); //save images to file structure.
        var imageObj = {
            "username":userID,
            "imagePaths": [{
                "path": targetLocation 
            }]
        }
        models.saveImg(imageObj); //save the image paths to the DB. 
    })
    .then(function(content){
       
            webpages.splice(0,1); //remove the first link which was used already
            userObjGlobal.links = webpages;
            page.close().then(function(){
                console.log("page is closed");
                loopOtherLinks();
            })
    })
    .catch(function (e) {
        console.log(e);
        restartPhantom(e);
    });
} 

function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    });
}

/**
 * Loop through other links; created to use same instance for couple of iterations; saving memory
 */
function loopOtherLinks(){
    console.log(webpages)
    console.log(counterIterations)
    //there exists more webpages then process them
    if(counterIterations <= webpages.length - 1){
        console.log("looping ..")
        counterIterations += 1;
        takeScreenshots(instanceGlobal, userObjGlobal);
    }
    else{
        console.log("shutting down...")
        var res = {message: "success", "location": targetLocation}
        instanceGlobal.exit();
        process.kill(processID);
        removeFromPhantomArray(processID)
        callbackGlobal(res)
    }
}

/**
 * Zip images for sending to user
 */
function zipImages(allImagesPaths, finalDestination){
    const zip = new AdmZip();

    allImagesPaths.forEach(item => {
        var path = item.path
        const p = stat(path);
        if (p.isFile()) {
            zip.addLocalFile(path);
        } else if (p.isDirectory()) {
            zip.addLocalFolder(path, path);
        }
    });

    zip.writeZip(finalDestination);
    callbackGlobal({message: "success", "location": finalDestination, err: "" });
}


/**
 * To retrive all the images belonging to the user from DB.
 */
function getImages(data){

    var username = data.username;
    var targetLocation = data.targetDirectory

    models.getImagesFromDB(username, function(allImagesPaths){
        console.log(allImagesPaths)
        if(!allImagesPaths){
            callbackGlobal({message: "failure", "location": targetLocation, err: "User doesnt have any screenshots" });
            return;
        }  

        var finalDestination = targetLocation  + "/" + username + "-" + new Date().toString();
        console.log("Screenshots are succesfully downloaded to "+ finalDestination);
        zipImages(allImagesPaths, finalDestination);
    })
}


function restartPhantomInstance(error){
    if(error){
        console.log(`Phantom error when processing ${e}`);
        try {
            console.log("process killed: ", processId);
            process.kill(processId);
        } catch (error) {
            console.log("process could not be killed: ", processID);
        }
    }

    removeFromPhantomArray(processID);
    console.log("removed")
    console.log(phantomChildren)
    initializePhantom(userObjGlobal)

}

function checkPhantomStatus() {
    if (phantomChildren.length < maxInstances) {
        return true;
    }
    return false;
}

// remove processID from phantomChildren array
function removeFromPhantomArray(pId) {
    var index = phantomChildren.indexOf(pId);
    phantomChildren.splice(index, 1);
}

