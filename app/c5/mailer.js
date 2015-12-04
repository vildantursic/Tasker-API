/**
 * Created by Vildan on 10/23/2015.
 */
var express      = require('express');
var router       = express.Router();
var inbox        = require("inbox");

//var cl       = require('./mailConnection');

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/c5/mailer');
//middleware api
api.all(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    /*Do stuffs here when a call to api route invoked*/
    //console.log(req.method,req.url);

    next();
});

//GET verb
api.get(function(req,res){

    var client = inbox.createConnection("993", req.query.mail, {
        secureConnection: true,
        auth:{
            user: req.query.user,
            pass: req.query.pass
        }
    });

    client.on("error", function (error){
        res.json(error);
    });

    client.connect();

    client.on("connect", function(err){
        if (err) res.json(err);

        console.log(req.query.user + " is successfully connected to mail server");
    });

    client.on("connect", function(){
        client.openMailbox("INBOX", function(error, info){
            if(error) res.json(err);
            //console.log("Message count in INBOX: " + info.count);

            // list newest 10 messages
            client.listMessages(-20, function(err, messages){
                if(err){
                    res.json(err);
                    res.statusCode = 404;
                }

                res.json(messages);
                res.statusCode = 200;

                client.close();
                client.on('close', function (){
                    console.log('DISCONNECTED!');
                });

            });
        });
    });

});
//POST verb
api.post(function(req,res){

    client.on("new", function(message){
        console.log("New incoming message " + message.title);
    });

});
//PUT verb
api.put(function(req,res){

});
//DELETE verb
api.delete(function(req,res){

    client.deleteMessage(req.query.uid, function(err){
        if (err) res.json(err);

        res.json("success, message deleted");
    });

});
//this line is the Master
module.exports.router = router;