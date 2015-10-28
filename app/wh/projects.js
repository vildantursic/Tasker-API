/**
 * Created by Vildan on 9/28/2015.
 */
var express     = require('express');
var router      = express.Router();
var fs          = require( "fs" );
var dateFormat  = require('dateformat');
var CronJob     = require('cron').CronJob;
var connection  = require('./connection');

var whProjectsGet = "SELECT * FROM `projects` WHERE 1 ORDER BY `id` DESC";
var whProjectsPost = "INSERT INTO `projects` SET ?";
var whProjectsDelete = "DELETE FROM `projects` WHERE ?";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/wh/projects');
//middleware api
api.all(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    /*Do stuffs here when a call to api route invoked*/
    //console.log(req.method,req.url);

    next();
});

var job = new CronJob({
    cronTime: '* * * * * *',
    onTick: function() {
        /*
         * Runs every weekday (Monday through Friday)
         * at 11:30:00 AM. It does not run on Saturday
         * or Sunday.
         */
        //console.log(new Date());

        connection.connection.query(whProjectsPost, {title: new Date()} , function(err, rows, fields) {
            if (err) console.log(err);

            //res.json(rows);

        });

    },
    start: false,
    timeZone: 'Europe/Belgrade'
});

job.start();

//GET projects
api.get(function(req,res){

    connection.connection.query(whProjectsGet, function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);

    });

});
//POST project
api.post(function(req,res){

    for(var i = 0; i <= 1000; i++) {
        connection.connection.query(whProjectsPost, req.body, function (err, rows, fields) {
            if (err) res.json(err);

            res.json(rows);

        });
    }

});
//PUT project
api.put(function(req,res){

});
//DELETE project
api.delete(function(req,res){

    connection.connection.query(whProjectsDelete, req.body, function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);

    });

});
//this line is the Master
module.exports.router = router;