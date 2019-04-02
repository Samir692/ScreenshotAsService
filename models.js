mongoose = require('mongoose'); //for mongoDB
modals = require('./app/models/screenshots-models')

/**
 * Connect to mongo db
 */
var mongoDB = 'mongodb://localhost:/screenshotsdb';
var promise = mongoose.connect(mongoDB, {
  useNewUrlParser: true
  /* other options */
}).then(() => console.log("connected"))
 .catch(err => console.log(err));

var db = mongoose.connection;

promise.then(() => {
    console.log("model has been added");
    db.model('WebImgs'); // Renters model  
    //modals.addDataFirstTime();
});