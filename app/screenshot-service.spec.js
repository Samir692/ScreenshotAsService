const screenshtService = require('./screenshot-service');
var chai = require('chai');
var expect = chai.expect;

describe('ScreenshotClien service', function(){
    it('initialize the service', function (){
         //expect(true).to.eql(false)

        var data = {
            "links": ["https://www.google.com/"],
            "userID": "test"
        }
        console.log(data)
        // var result = screenshtService.initializeService(data);
        // expect(screenshtService.userObjGlobal).to.eql(data);
        //expect(true).to.eql(false)


    })
});