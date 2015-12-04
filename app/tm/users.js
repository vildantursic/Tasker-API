/**
 * Created by Vildan on 8/15/2015.
 */

var express    = require('express');
var router     = express.Router();
var pg         = require('pg');
var ncache     = require( "node-cache" );
var fs         = require( "fs" );
var dateFormat = require('dateformat');

var now = new Date();

//postgres connection string
var conString = "postgres://projop:@77.78.198.112:45432/projop";

var projopCache = new ncache();

var poUsers = "select * from acs_users_all order by first_names asc";
var poUsersPost = "insert into users (user_id, username) values ($1, $2)";
var poUsersPut = "update users set username=$1 where user_id=$2";
var poUsersDelete = "delete from users where user_id=$1 and username=$2";

router.get('/',function(req,res){

    res.send("Welcome to Project Open API");
});

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/users');
//middleware api
api.all(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");

    /*Do stuffs here when a call to api route invoked*/
    //console.log(req.method,req.url);

    fs.appendFile('log.txt', 'Date: '+ dateFormat(now) + ' // Log: '+req.method+','+req.url+'\n', function (err) {
        if (err) throw err;
        //console.log('The "data to append" was appended to file!');
    });

    next();
});

/* CASHING TASKS */
(function cashUsers(){

    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poUsers, function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
                //return console.error('error running query', err);
            }
            //res.json(result);
            projopCache.set( "projopUsers", result, function( err, success ) {
                if (!err && success) {
                    console.log(success);
                }
            });
        });

    });

})();


//GET verb
api.get(function(req,res){

    projopCache.get( "projopUsers", function( err, value ){
        if( !err ){
            if(value == undefined){
                // key not found
                res.statusCode = 404;
            }else{
                res.statusCode = 200;
                res.json( value );
            }
        }
    });

});
//POST verb
api.post(function(req,res){

    res.json(req.body);

    //pg.connect(conString, function(err, client, done) {
    //
    //    if (err) {
    //        res.send('error fetching client from pool' + err);
    //        //return console.error('error fetching client from pool', err);
    //    }
    //    client.query(poUsersPost, [req.body.user_id, req.body.username],function(err, result) {
    //        done();
    //        if (err) {
    //            res.send('error running query' + err);
    //            //return console.error('error running query', err);
    //        }
    //        res.json("User created");
    //
    //    });
    //
    //});
});
//PUT verb
api.put(function(req,res){
    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poUsersPut, [req.body.username, req.body.user_id], function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
                //return console.error('error running query', err);
            }
            res.json("User updated");

        });

    });
});
//DELETE verb
api.delete(function(req,res){

    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poUsersDelete, [req.body.user_id, req.body.username], function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
                //return console.error('error running query', err);
            }
            res.json("User deleted");

        });

    });
});
//this line is the Master
module.exports.router = router;