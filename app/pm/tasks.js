/**
 * Created by Vildan on 10/14/2015.
 */
var express    = require('express');
var router     = express.Router();
var fs         = require( "fs" );
var dateFormat = require('dateformat');
var connection = require('../wh/connection');

var now = new Date();

var pmTasksGet = "SELECT * FROM `tasks`";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/pm/tasks');
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

    connection.connection.query(pmTasksGet, function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);
    });

});
//POST verb
api.post(function(req,res){


});
//PUT verb
api.put(function(req,res){


});
//DELETE verb
api.delete(function(req,res){


});
//this line is the Master
module.exports.router = router;