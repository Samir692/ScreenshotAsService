var app = require('express')(),
    server = require('http').Server(app);

app.get('/', function (req, res) {
    console.log(`${req.ip} requested end-user interface`);

    res.sendFile(__dirname + '/index.html');
});


server.listen(5001);

