/**
 * Created by Vildan on 10/26/2015.
 */

var express    = require('express');
var inbox        = require("inbox");

var data = {
    user: 'vildantursic@hotmail.com',
    pass: 'myhunnybunny111',
    mail: 'imap-mail.outlook.com'
};

// imap-mail.outlook.com
// imap.gmail.com
var client = inbox.createConnection("993", data.mail, {
    secureConnection: true,
    auth:{
        user: data.user,
        pass: data.pass
    }
});

client.on("error", function (error){
    res.json(error);
});

client.connect();

client.on("connect", function(err){
    if (err) res.json(err);

    console.log(data.user + " is successfully connected to mail server");
});

module.exports.client = client;