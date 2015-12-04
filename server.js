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
    res.send("Welcome to Global GPS API");
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
/* FinanceManager */
var FNbanking = require('./app/fn/banking').router;


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
/////////////////
app.use('/', FNbanking);

// START THE SERVER
// =============================================================================
server.listen(port);
console.log('listening on port: ' + port);

var users = {};

io.on('connection', function (socket) {

    socket.on('new user', function(data, callback){
        if(data in users){
            callback(false);
        }
        else {
            callback(true);
            socket.nickname = data;
            //connectedUsers.push(socket.nickname);
            users[socket.nickname] = socket;
            userConnection();
        }
    });

    function userConnection(){
        io.emit('usernames', Object.keys(users));
    }

    console.log('a user connected');

    socket.on('chat message', function(data, callback){
        var msg = data.trim();
        if(msg.substr(0,3) === '/w '){
            msg = msg.substr(3);
            var ind = msg.indexOf(' ');
            if(ind !== -1){
                var name = msg.substring(0, ind);
                msg = msg.substring(ind + 1);
                if (name in users){
                    users[name].emit('whisper', {msg: msg, nick: socket.nickname});
                    console.log("whisper");
                }
                else {
                    callback("Please enter a valid user");
                }
            }
            else {
                callback("Please enter message for you whisperer");
            }
        }
        else{
            io.emit('chat message', {msg: msg, nick: socket.nickname});
        }
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete users[socket.nickname];
        //connectedUsers.splice(connectedUsers.indexOf(socket.nickname), 1);
        userConnection();
    });


});
