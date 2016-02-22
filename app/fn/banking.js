/**
 * Created by Vildan on 9/29/2015.
 */
var express    = require('express');
var router     = express.Router();
var fs         = require( "fs" );
var S          = require('string');
var dateFormat = require('dateformat');
// var pool = require('./connection');
var connection = require('./connection');
var xmlreader  = require('xmlreader');
var multiparty = require('connect-multiparty');
var path       = require('path');

var loc = path.join(__dirname, 'BANKING');


var multipartyMiddleware = multiparty({
  autoFiles: true,
  uploadDir: loc
});

var fnRaiffaizenBankingGet = "SELECT * FROM `Receipt`";
// var fnBankingPost = "INSERT INTO `Receipt` SET ? ON DUPLICATE KEY UPDATE sifra_doznake=";
var fnRaiffaizenBankingPost = "INSERT INTO `Receipt` SET ?";

var fnBbiBankingGet = "SELECT * FROM `finances_bbi`";
var fnBbiBankingPost = "INSERT INTO `finances_bbi` SET ?";

// ROUTES FOR OUR API
// =============================================================================

/*RESTful API Router*/
var api = router.route('/api/v1/fn/banking');
//middleware api
api.all(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    /*Do stuffs here when a call to api route invoked*/
    //console.log(req.method,req.url);

    next();
});

// options for CORS requsts
api.options(function(req, res){
  res.json({});
  console.log("something hit options");
});

//GET verb
api.get(function(req, res){

  if(req.query.bank === "BBI"){

    pool.pool.getConnection(function(err, connection) {
      connection.query(fnBbiBankingGet, function(err, rows) {
          if (err) res.json(err);

          res.json(rows);

          // And done with the connection.
          connection.release();
      });
    });

  }
  else if(req.query.bank === "RFBI"){

    pool.pool.getConnection(function(err, connection) {
      connection.query(fnRaiffaizenBankingGet, function(err, rows) {
          if (err) res.json(err);

          res.json(rows);

          // And done with the connection.
          connection.release();
      });
    });

  }

});

//POST verb
api.post(multipartyMiddleware, function(req,res){

    // We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file;
    var bank = req.body.bank;
    var BankingPost = '';

    //reading each file which is uploaded
    for(var f=0; f<file.length; f++){

      // get each file data
      fs.readFile(file[f].path, 'utf8', function (err,data) {
          if (err) {
              res.json(err);
          }

          //getting parsed data in json format
          dbTransaction = getJsonFromXml(data, bank);

          // console.log(dbTransaction);

          if (bank === "BBI"){
            BankingPost = fnBbiBankingPost;
          }
          else if (bank === "RFBI"){
            BankingPost = fnRaiffaizenBankingPost;
          }

          // getting all data from single object and uploading to database
          for(var i=0; i<dbTransaction.length; i++){

            pool.pool.getConnection(function(err, connection) {
              connection.query(BankingPost, dbTransaction[i], function(err, rows) {
                  if (err) res.json(err);

                  // And done with the connection.
                  connection.release();
              });
            });

          }

          res.json("success");
      });

    }

});
//this line is the Master
module.exports.router = router;

//////////////////////
// Going down the stream, parsing all data from object to satisfy object for storing into db
// functions are separated so they can be stored in another file or reused later.

/**
 * Json to XML parser
 *
 * @param {object} xmlObject - xml object
 * @param {string} bank - name of bank for which data is passed
 * @return {object} transaction - Json formated transaction data
 */
function getJsonFromXml(xmlObject, bank) {

  var transactions = [];

  xmlreader.read(xmlObject, function (err, res){
      if(err) return console.log(err);

      if(bank === "RFBI"){
        try {
          res.IZ.PR.each(function (i, PR){
              transactions[i] = collectDataToOneObject(res.IZ.attributes(), PR.attributes());
          });
        }
        catch (err) {
          console.log("Missed object : " + res.IZ.PR.text());
        }
      }
      else if(bank === "BBI"){
        try {
          res.IZVOD.TRANSAKCIJE.TRANSAKCIJA.each(function (i, TRANSAKCIJA){
              var temp = {};

              temp = {
                "DIRECTION": TRANSAKCIJA.DIRECTION.text(),
                "DATUM_KNJIZENJA": TRANSAKCIJA.DATUM_KNJIZENJA.text(),
                "REFERENCA": TRANSAKCIJA.REFERENCA.text(),
                "TIPDOKUMENTA": TRANSAKCIJA.TIPDOKUMENTA.text(),
                "TRANSAKCIJA": TRANSAKCIJA.TRANSAKCIJA.text(),
                "ORDID": TRANSAKCIJA.ORDID.text(),
                "REF_BANK": TRANSAKCIJA.REF_BANK.text(),
                // "REF_ACCOUNT": TRANSAKCIJA.REF_ACCOUNT.text(),
                "REF_ACC_NAME": TRANSAKCIJA.REF_ACC_NAME.text(),
                "NAPOMENA": TRANSAKCIJA.NAPOMENA.text(),
                "VALUTA": TRANSAKCIJA.VALUTA.text(),
                "IZNOS": TRANSAKCIJA.IZNOS.text(),
                // "PORESKI_BROJ_UPL": TRANSAKCIJA.PORESKI_BROJ_UPL.text()
              };

              transactions[i] = temp;
              transactions[i] = keyToLowerCase2(transactions[i]);
          });
        }
        catch (err){
          console.log("Missed object : " + res.IZVOD.ZAGLAVLJE.OD_DATUMA.text());
        }
      }

  });

  return transactions;

}

//Because IZ (izvod) is main xml representative we decided to include it as part of each transaction or PR ()
//this function is concatinating IZ with each PR object from IZ.

/**
 * Collect data to single object for easier management of data.
 * @return {object} transaction - single transaction object.
 */
function collectDataToOneObject() {
  var ret = {};
  var len = arguments.length;
  for (var i=0; i<len; i++) {
    for (p in arguments[i]) {
      if (arguments[i].hasOwnProperty(p)) {
        ret[p] = arguments[i][p];
      }
    }
  }
  return keyToLowerCase(ret);
}

//For more responsive object we parsed each object key to lower case letters. Easier to store in db.
function keyToLowerCase(obj) {
  var key, keys = Object.keys(obj);
  var n = keys.length;
  var newobj={}
  while (n--) {
    key = keys[n];
    newobj[key.toLowerCase()] = obj[key];
  }

  return commaToDotReplacer(newobj);
}
function keyToLowerCase2(obj) {
  var key, keys = Object.keys(obj);
  var n = keys.length;
  var newobj={}
  while (n--) {
    key = keys[n];
    newobj[key.toLowerCase()] = obj[key];
  }

  return dateConverter2(newobj);
}

//MySql database int types required dots instead of commas.
//Replace all object values with dots instead of commas.
function commaToDotReplacer(obj){

  for (var key in obj) {
      obj[key] = obj[key].replace(',','.');
  }

  return dateConverter(obj);
}

//Date in IZ and PR have come in format of "dd.mm.yyyy" and iso converter needed format of "yyyy.mm.dd"
//so that it can convert it for db timestamp format.
//If there is better way of getting substring of date object please do it.
function dateConverter(obj){

  function dateParser(date){

    day = date.substring(0, 2);
    month = date.substring(3, 5);
    year = date.substring(6);

    date = year + '.' + month + '.' + day;

    return dateFormat(date, "isoDateTime");
  }

  obj.datum_izvoda = dateParser(obj.datum_izvoda);
  obj.datum_naloga = dateParser(obj.datum_naloga);
  obj.datum_valute = dateParser(obj.datum_valute);

  return obj;
}
function dateConverter2(obj){

  function dateParser(date){

    day = date.substring(0, 2);
    month = date.substring(3, 5);
    year = date.substring(6);

    date = year + '.' + month + '.' + day;

    return dateFormat(date, "isoDateTime");
  }

  obj.datum_knjizenja = dateParser(obj.datum_knjizenja);

  return obj;
}
