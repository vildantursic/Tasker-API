/**
 * Created by Vildan on 9/29/2015.
 */
var express    = require('express');
var router     = express.Router();
var fs         = require( "fs" );
var S          = require('string');
var dateFormat = require('dateformat');
var connection = require('./connection');

var now = new Date();

var whTasksPost = "INSERT INTO `tasks` SET ?";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/wh/orders');
//middleware api
api.all(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    /*Do stuffs here when a call to api route invoked*/
    //console.log(req.method,req.url);

    next();
});

function taskCreator(data){

    var phrase = S(data).lines();

    var arr = [];

    var numOfTasks = 0;

    for(var i = 0; i <= phrase.length; i++){
        if(phrase[i] == "more") {
            numOfTasks++;

            var task = {};

            task.task_name = phrase[i-7].substr(phrase[i-7].indexOf(':')+2, phrase[i-7].length);
            task.assigned_username = phrase[i-6].substr(phrase[i-6].indexOf(':')+2, phrase[i-6].length);
            task.end_time = dateFormat(phrase[i-5].substr(phrase[i-5].indexOf(':')+2, phrase[i-5].length), "isoDateTime");
            task.parent_project = phrase[i-4].substr(phrase[i-4].indexOf(':')+2, phrase[i-4].length);
            task.parent_task = phrase[i-3].substr(phrase[i-3].indexOf(':')+2, phrase[i-3].length);
            task.description = phrase[i-2].substr(phrase[i-2].indexOf(':')+2, phrase[i-2].length);
            task.task_specifics = phrase[i-1].substr(phrase[i-1].indexOf(':')+2, phrase[i-1].length);

            arr[numOfTasks] = task;
        }
    }

    return arr;
}

//POST verb
api.post(function(req,res){

    fs.readFile('/Users/Vildan/Desktop/tasker.txt', 'utf8', function (err,data) {
        if (err) {
            res.json(err);
        }

        var arrOfTask = taskCreator(data);

        for(var i = 1; i <= arrOfTask.length; i++){
            connection.connection.query(whTasksPost, arrOfTask[i], function(err, rows, fields) {
                if (err) res.json(err);

                res.json(rows);
            });
        }

    });

});
//this line is the Master
module.exports.router = router;