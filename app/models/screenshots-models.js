var mongoose = require('mongoose');

/*
* screenshot-backends Schema
*/
var imagesSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    imagePaths:[
        { path:
            {
                type:String,
                required:true
            }
        }
    ]  
}, {collection: "images"});

/* Compile model from schema */
var WebImgs = mongoose.model('WebImgs', imagesSchema );

/* Add dummy data first time */
module.exports.addDataFirstTime = function(callback){
    WebImgs.create(
        {
            "username": "admin",
            "imagePaths": [{
                path: "/admin"
            }],
          },
           callback);
};

/**
 * save screenshots the DB.
 */
module.exports.saveImg = function(imageObj, callback){
    var username = imageObj.username;
    var user = {username: username}
    //check if user exists
    findUser(user, function(err, user){

        if(err || !user){
            console.log("didnt find user")
            addUser(imageObj, function(err){
                if(err)
                    return err;
            })         
        }
        else{
            console.log("found user")
            imageObj['_id'] = user._id;
            addImage(imageObj, function(err, document){
                console.log("image has been added");
                if(err)
                    return err
            });
        }
        return;
    })
}

/* 
* Add user
*/
function addUser(user, callback){
    var data = user;
    console.log("adding user..")
    WebImgs.create(data, function(err){
        if(err){
            console.log(err); 
            callback(err);
        }
    });
};

/* 
* Find user
*/
function findUser(user, callback){

    WebImgs.findOne(user, function(err, document){
        console.log(err);
        if(err){
            console.log(err)
        }
        callback(err, document);
    });
}

/* 
* Add image
*/
function addImage(user_data, callback){
    var data = user_data;
    console.log("adding images");
    WebImgs.updateOne(
        {_id: data._id},
        {$push: {'imagePaths': data.imagePaths}},
        data,
        function(err, document){
            console.log(err);
            if(err){
                callback(err);
                return
            }
            callback(document)
        }
    );
};

/* 
* Get all the images
*/
module.exports.getImagesFromDB = function(username, callback){
    console.log("looking= "+ username)
    var user = {"username":username}
    findUser(user, function(err, user){
        if(user){
            console.log("user found")
            callback(user.imagePaths)
        }
        if(err){
            console.log(err)
            callback(err);

        }
    })
}
