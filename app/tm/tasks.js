/**
 * Created by Vildan on 9/28/2015.
 */
var express    = require('express');
var router     = express.Router();
var fs         = require( "fs" );
var dateFormat = require('dateformat');
var pool = require('./connection');

var now = new Date();

var tmTasksGet = "SELECT * FROM `tasks`";
var tmTasksPost = "INSERT INTO `tasks` SET ?";
var tmTasksPut = "UPDATE tasks SET ? WHERE id = ";
var tmTasksDelete = "DELETE FROM `tasks` WHERE id = ";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/tm/tasks');
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
  });
}

function routing(data){

  var task_specifics = JSON.parse(data[0].task_specifics);
  var decodedString = new Buffer(task_specifics[0].value, 'base64');
  var new_data = JSON.parse(decodedString.toString());

  var myData = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": new_data,
        "properties": {
          "color": "blue"
        }
      }
    ]
  }

  data[0].task_specifics = [task_specifics[2], myData];

  for(var i=1; i< data.length; i++){
    data[i].task_specifics = JSON.parse(data[i].task_specifics);
  }

  // console.log(new_data);
  // var converted = tj.gpx(new_data);
  // var converted_with_styles = tj.gpx(new_data, { styles: true });

  // osmGpx(decodedString.toString(), function(err, gpx, geojson) {
  //   if(err) throw err;
  //
  //   task_route = geojson;
  //
  // });

  // gpxParse.parseGpx(decodedString, function(error, data) {
  // 	if(error) throw error;
  //
  //   var new_data = jsdom(data);
  //   var converted = tj.gpx(new_data);
  //   // var converted_with_styles = tj.gpx(new_data, { styles: true });
  //
  // });

  return data;
};

// ==================== //

// options for CORS requsts
api.options(function(req, res){
  res.json({});
  console.log("something hit options");
});

//GET verb
api.get(function(req,res){

    requests(tmTasksGet, req, res, true);

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
