/**
* Created by Vildan on 9/28/2015.
*/
var express     = require('express');
var router      = express.Router();
var fs          = require( "fs" );
var dateFormat  = require('dateformat');
var CronJob     = require('cron').CronJob;
var pool  = require('./connection');
var server     = require('http')
var io = require('socket.io')(server);

var whProjectsGet = "SELECT * FROM `projects` WHERE 1 ORDER BY `id` DESC LIMIT 1000";
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

io.on('connection', function(socket){
  console.log("ok");
  io.emit('project', 'proj creat');
})

//HELPER functions

/**
 * Gets data from database and returns data in Json format.
 * @param {string} qry - Query for database.
 * @param {string} req - Request data which is passed to query (body or query).
 * @param {string} res - Response parameter for returning data in Json format.
 */
function requests(qry, req, res){
  pool.pool.getConnection(function(err, connection) {
    connection.query(qry, req, function(err, rows) {
      if (err) {
        res.json(err);
        res.statusCode = 404;
      }

      res.statusCode = 200;
      res.json(rows);

      // And done with the connection.
      connection.release();
    });
  });
}

// ==================== //

var job = new CronJob({
   cronTime: '00 30 11 * * 1-5',
   onTick: function() {
       /*
        * Runs every weekday (Monday through Friday)
        * at 11:30:00 AM. It does not run on Saturday
        * or Sunday.
        */

        pool.pool.getConnection(function(err, connection) {
          connection.query(whProjectsPost, {title: new Date()}, function(err, rows) {
            if (err) {
              throw err;
              // res.json(err);
              // res.statusCode = 404;
            }

            // res.statusCode = 200;
            // res.json(rows);
            console.log('Project Created');

            // And done with the connection.
            connection.release();
          });
        });

   },
   start: false,
   timeZone: 'Europe/Belgrade'
});

job.start();


// options for CORS requsts
api.options(function(req, res){
  res.json({});
  console.log("something hit options");
});

//GET projects
api.get(function(req,res){

  requests(whProjectsGet, req, res);

});
//POST project
api.post(function(req,res){

  requests(whProjectsPost, req.body, res);

});
//PUT project
api.put(function(req,res){

});
//DELETE project
api.delete(function(req,res){

  requests(whProjectsDelete, req.body, res);

});
//this line is the Master
module.exports.router = router;
