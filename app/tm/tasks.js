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

var poTasks = "select "+
    "r.rel_id as id, "+
    "(select username from users where user_id = r.object_id_two) as username, "+
    "acs_object__name(o.object_id) as task, "+
    "acs_object__get_attribute(o.object_id, 'note') as note, "+
    "acs_object__get_attribute(cast(acs_object__get_attribute(o.object_id, 'parent_id') as integer), 'project_name') as project, "+
    "acs_object__get_attribute(cast(acs_object__get_attribute(o.object_id, 'company_id') as integer), 'company_name') as company, "+
    "cast(o.creation_date as timestamp) as assignment_date, "+
    "cast(acs_object__get_attribute(o.object_id, 'creation_date') as timestamp) as creation_date, "+
    "cast(acs_object__get_attribute(o.object_id, 'start_date') as timestamp) as start_date, "+
    "cast((select end_date from im_projects where project_id = cast(acs_object__get_attribute(o.object_id, 'parent_id') as integer)) as timestamp) as end_date, "+
    "cast((select deadline_date from im_timesheet_tasks where task_id = o.object_id) as timestamp) as deadline_date, "+
    "(select percent_completed from im_projects where project_id = cast(acs_object__get_attribute(o.object_id, 'parent_id') as integer)) as percent_completed, "+
    "(select category from im_categories where category_id = cast(acs_object__get_attribute(o.object_id, 'project_status_id') as integer)) as status "+
    "from "+
    "acs_rels r, "+
    "acs_object_types rt, "+
    "acs_objects o, "+
    "acs_object_types ot "+
    "left outer join (select * from im_biz_object_urls where url_type = 'view') otu on otu.object_type = ot.object_type "+
    "where "+
    "r.rel_type = rt.object_type and "+
    "o.object_type = ot.object_type and "+
    "r.object_id_one = o.object_id and "+
    "o.object_type = 'im_timesheet_task' and "+
    "r.rel_id > 0 "+
    "order by "+
    "r.rel_id asc";

var poTasksPost = "select im_timesheet_task__new($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $12, $13, $14, $15)";
// integer,
// character varying,
// timestamp with time zone,
// integer,
// character varying,
// integer,
// character varying,
// character varying,
// integer,
// integer,
// integer,
// integer,
// integer,
// integer,
// character varying

var poTasksPut = "select im_timesheet_task__new($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $12, $13, $14, $15)";

var poTasksDelete = "select im_timesheet_task__delete($1)";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/tasks');
//middleware api
api.all(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");

    fs.appendFile('log.txt', 'Date: '+ dateFormat(now) + ' // Log: '+req.method+','+req.url+'\n', function (err) {
        if (err) throw err;
    });

    next();
});

/* CASHING TASKS */
(function cashTasks(){

    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poTasks, function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
                //return console.error('error running query', err);
            }
            //res.json(result);
            projopCache.set( "projopTasks", result, function( err, success ) {
                if (!err && success) {
                    console.log(success);
                }
            });
        });

    });

})();

//GET verb
api.get(function(req,res){

    projopCache.get( "projopTasks", function( err, value ){
        if( !err ){
            if(value == undefined){
                // key not found
            }else{
                res.json( value );
            }
        }
    });

    //pg.connect(conString, function(err, client, done) {
    //
    //    if (err) {
    //        res.send('error fetching client from pool' + err);
    //        //return console.error('error fetching client from pool', err);
    //    }
    //    client.query(poTasks, function(err, result) {
    //        done();
    //        if (err) {
    //            res.send('error running query' + err);
    //            //return console.error('error running query', err);
    //        }
    //        res.json(result);
    //        //projopCache.set( "projopTasks", result, function( err, success ) {
    //        //    if (!err && success) {
    //        //        console.log(success);
    //        //    }
    //        //});
    //    });
    //
    //});

});
//POST verb
api.post(function(req,res){

    //pg.connect(conString, function(err, client, done) {
    //
    //    if (err) {
    //        res.send('error fetching client from pool' + err);
    //        //return console.error('error fetching client from pool', err);
    //    }
    //    client.query(poTasksPost,
    //        [req.body.p_task_id,
    //        req.body.p_object_type,
    //        req.body.p_creation_date,
    //        req.body.p_creation_user,
    //        req.body.p_creation_ip,
    //        req.body.p_context_id,
    //        req.body.p_task_nr,
    //        req.body.p_task_name,
    //        req.body.p_project_id,
    //        req.body.p_material_id,
    //        req.body.p_cost_center_id,
    //        req.body.p_uom_id,
    //        req.body.p_task_type_id,
    //        req.body.p_task_status_id,
    //        req.body.p_description], function(err, result) {
    //        done();
    //        if (err) {
    //            res.send('error running query' + err);
    //            //return console.error('error running query', err);
    //        }
    //        res.json(result);
    //    });
    //
    //});

    res.json(res.body);

});
//PUT verb
api.put(function(req,res){

    pg.connect(conString, function(err, client, done) {

        if (err) {
            res.send('error fetching client from pool' + err);
            //return console.error('error fetching client from pool', err);
        }
        client.query(poTasksPut, [req.body.task.p_task_id,
            req.body.task.p_object_type,
            req.body.task.p_creation_date,
            req.body.task.p_creation_user,
            req.body.task.p_creation_ip,
            req.body.task.p_context_id,
            req.body.task.p_task_nr, p_task_name,
            req.body.task.p_project_id,
            req.body.task.p_material_id,
            req.body.task.p_cost_center_id,
            req.body.task.p_uom_id,
            req.body.task.p_task_type_id,
            req.body.task.p_task_status_id,
            req.body.task.p_description], function(err, result) {
            done();
            if (err) {
                res.send('error running query' + err);
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
        client.query(poTasksDelete, [req.body.p_task_id], function(err, result) {
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

