// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var router     = express.Router();
var app        = express();                 // define our app using express
var server     = require('http').Server(app);
var io         = require('socket.io')(server);
var bodyParser = require('body-parser');

router.get('/',function(req,res){
    res.send("Welcome to Task Manager API");
});

/* Schemas */
var userSchema  = require('./app/models/user');

/* Routes */
/* TaskManager */
//var TMusers = require('./app/tm/users').router;
//var TMtasks = require('./app/tm/tasks').router;
//var TMprojects = require('./app/tm/projects').router;
/* WarehouseManager */
var WHprojects = require('./app/wh/projects').router;
var WHtasks = require('./app/wh/tasks').router;
var WHorders = require('./app/wh/orders').router;
/* ProjectManager */
var PMprojects = require('./app/pm/projects').router;
var PMtasks = require('./app/pm/tasks').router;
/* C5 communication */
var C5mailer = require('./app/c5/mailer').router;
var C5chat = require('./app/c5/chat').router;


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 7001;        // set our port

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/', TMusers);
//app.use('/', TMtasks);
//app.use('/', TMprojects);
/////////////////
app.use('/', WHprojects);
app.use('/', WHtasks);
app.use('/', WHorders);
/////////////////
app.use('/', PMprojects);
app.use('/', PMtasks);
/////////////////
app.use('/', C5mailer);
app.use('/', C5chat);

// START THE SERVER
// =============================================================================
server.listen(port);
console.log('listening on port: ' + port);

io.on('connection', function (socket) {

    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

});