/**
 * Created by Vildan on 9/28/2015.
 */
var express    = require('express');
var router     = express.Router();
var fs         = require( "fs" );
var dateFormat = require('dateformat');
var pool = require('./connection');

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

//HELPER functions

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

// options for CORS requsts
api.options(function(req, res){
  res.json({});
  console.log("something hit options");
});

//GET verb
api.get(function(req,res){

    requests(whTasksGet, req.query, res);

});
//POST verb
api.post(function(req,res){

    requests(whTasksPost, req.body, res);

});
//PUT verb
api.put(function(req,res){

    var id = req.body.id;

    var data = req.body;
    delete data.id;
    delete data.start_time;

    req.data = data;

    requests(whTasksPut + id, req.data, res);

});
//DELETE verb
api.delete(function(req,res){

    requests(whTasksDelete + req.query.id, req, res);

});
//this line is the Master
module.exports.router = router;
