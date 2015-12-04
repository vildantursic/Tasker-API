/**
 * Created by Vildan on 9/28/2015.
 */
var express    = require('express');
var router     = express.Router();
var fs         = require( "fs" );
var dateFormat = require('dateformat');
var connection = require('./connection');

var now = new Date();

var whTasksGet = "SELECT * FROM `tasks` WHERE ? ORDER BY `start_time` DESC";
var whTasksPost = "INSERT INTO `tasks` SET ?";
var whTasksPut = "UPDATE tasks SET ? WHERE id = ";
var whTasksDelete = "DELETE FROM `tasks` WHERE id = ";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/wh/tasks');
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

    connection.connection.query(whTasksGet, req.query, function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);
    });

});
//POST verb
api.post(function(req,res){

    connection.connection.query(whTasksPost, req.body, function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);
    });

});
//PUT verb
api.put(function(req,res){

    var id = req.body.id;

    var data = req.body;
    delete data.id;
    delete data.start_time;

    connection.connection.query(whTasksPut + id, data, function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);
    });

});
//DELETE verb
api.delete(function(req,res){

    var id = req.query.id;

    connection.connection.query(whTasksDelete + req.query.id, function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);
    });

});
//this line is the Master
module.exports.router = router;
