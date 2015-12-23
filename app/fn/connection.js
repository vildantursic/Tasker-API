/**
 * Created by Vildan on 11/11/2015.
 */

var express    = require('express');
var mysql      = require('mysql');

// var pool = mysql.createPool({
//     // host     : '192.168.0.3',
//     //connectionLimit : 10,
//     host            : '192.168.0.3',
//     port            : '3306',
//     user            : 'root',
//     password        : 'globalgps',
//     database        : 'finances'
// });

var connection = mysql.createConnection({
    // host     : '192.168.0.3',
    //connectionLimit : 10,
    host            : '192.168.0.3',
    port            : '3306',
    user            : 'root',
    password        : 'globalgps',
    database        : 'finances'
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});


module.exports = connection;
