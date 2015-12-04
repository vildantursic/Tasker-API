/**
 * Created by Vildan on 8/15/2015.
 */

var express = require('express');
var router = express.Router();
var pg         = require('pg');
var ncache     = require( "node-cache" );
var fs         = require( "fs" );
var dateFormat = require('dateformat');

var now = new Date();

//postgres connection string
var conString = "postgres://projop:@77.78.198.112:45432/projop";

var projopCache = new ncache();

var poProjects = "select * from im_projects";

var poProjectsPost = "select im_project__new($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)";
// integer,
// character varying,
// timestamp with time zone,
// integer,
// character varying,
// integer,
// character varying,
// character varying,
// character varying,
// integer,
// integer,
// integer,
// integer

var poProjectsPut = "select im_project__new($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)";

var poProjectsDelete = "select im_project__delete($1)";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/projects');
//middleware api
api.all(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");

    /*Do stuffs here when a call to api route invoked*/
    //console.log(req.method,req.url);

    fs.appendFile('log.txt', 'Date: '+ dateFormat(now) + ' // Log: '+req.method+','+req.url+'\n', function (err) {
        if (err) throw err;
    });

    next();
});

/* CASHING TASKS */
(function cashProjects(){

    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poProjects, function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
                //return console.error('error running query', err);
            }
            //res.json(result);
            projopCache.set( "projopProjects", result, function( err, success ) {
                if (!err && success) {
                    console.log(success);
                }
            });
        });

    });

})();

//GET verb
api.get(function(req,res){

    projopCache.get( "projopProjects", function( err, value ){
        if( !err ){
            if(value == undefined){
                // key not found
            }else{
                res.json( value );
            }
        }
    });

});
//POST verb
api.post(function(req,res){

    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poProjectsPost,
                [req.body.project.p_project_id,
                req.body.project.p_object_type,
                req.body.project.p_creation_date,
                req.body.project.p_creation_user,
                req.body.project.p_creation_ip,
                req.body.project.p_context_id,
                req.body.project.p_project_name,
                req.body.project.p_project_nr,
                req.body.project.p_project_path,
                req.body.project.p_parent_id,
                req.body.project.p_company_id,
                req.body.project.p_project_type_id,
                req.body.project.p_project_status_id], function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
            }
            res.json(result);
        });

    });

});
//PUT verb
api.put(function(req,res){

    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poProjectsPut,
            [req.body.project.p_project_id,
            req.body.project.p_object_type,
            req.body.project.p_creation_date,
            req.body.project.p_creation_user,
            req.body.project.p_creation_ip,
            req.body.project.p_context_id,
            req.body.project.p_project_name,
            req.body.project.p_project_nr,
            req.body.project.p_project_path,
            req.body.project.p_parent_id,
            req.body.project.p_company_id,
            req.body.project.p_project_type_id,
            req.body.project.p_project_status_id], function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
                //return console.error('error running query', err);
            }
            res.json(result);
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
        client.query(poProjectsDelete, [req.query.v_project_id], function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
                //return console.error('error running query', err);
            }
            res.json(result);
        });

    });

});
//this line is the Master
module.exports.router = router;

