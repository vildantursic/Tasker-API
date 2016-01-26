/**
 * Created by Vildan on 9/28/2015.
 */
var express    = require('express');
var router     = express.Router();
var fs         = require( "fs" );
var dateFormat = require('dateformat');
var gpxParse = require('gpx-parse');
var pool = require('./connection');
var tj = require('togeojson');
var osmGpx = require('osm-gpx');
var jsdom = require('jsdom').jsdom;

var now = new Date();

var fmRequestGet = "SELECT * FROM `requests`";
var fmRequestStoreProcedure = "CALL createRoute(";

// var fmRequestPut = "UPDATE requests SET ? WHERE id = ";
// var fmRequestDelete = "DELETE FROM `requests` WHERE id = ";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/fm/route');
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

function requests(qry, req, res, ad){
  pool.pool.getConnection(function(err, connection) {
    connection.query(qry, req, function(err, rows) {
      if (err) {
        res.json(err);
        res.statusCode = 404;
      }

      if(ad){
        res.statusCode = 200;
        res.json(routing(rows));
      }
      else {
        res.statusCode = 200;
        res.json(rows);
      }

      // And done with the connection.
      connection.release();
    });

    // qry.on('result', function(fields, index){
    //   console.log(fields);
    // })

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

  // requests(fmRequestGet, req, res, false);

});
//POST verb
api.post(function(req,res){

  requests('CALL createRoute("'+req.body.coordinates+'","'+req.body.stop_types+'","'+req.body.start_name+'","'+req.body.end_name+'","'+req.body.project+'",'+'@result'+'); Select @result', req, res, false);

});
//PUT verb
api.put(function(req,res){

});
//DELETE verb
api.delete(function(req,res){

});
//this line is the Master
module.exports.router = router;
