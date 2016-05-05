/**
 * http://usejsdoc.org/
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var Client = require('node-rest-client').Client;
var client = new Client();
var mysql = require('mysql');


var con = mysql.createConnection({
	  host: "healthcare.cjedykpuszoe.us-west-1.rds.amazonaws.com",
	  user: "healthcare",
	  password: "healthcare",
	  database: "healthcare"
	});

router.post('/sendheartdata', function(req, res) {
	console.log("here");
	
	var loginEmail = req.body.loginEmail;
	var loginPassword = req.body.loginPassword;

	res.send("ok");
});

router.post('/storeheartdata', function(req, res) {
	console.log("here");
	
	var id = req.body.id;
	var pulse = req.body.pulse;
	var activity = req.body.status;
	var latitude = req.body.lat;
	var longitude = req.body.long;
	var  d = Date.now();
	
	var heartdata = { u_id: id, h_activity: activity,  h_heartrate:pulse , create_ts:d , latitude:latitude , longitude:longitude};
	
	con.query('INSERT INTO heartdata SET ?', heartdata, function(err,result){
		  if(err) {
			  console.log(err);
			  res.send("Error");
		  }
		  else{
		  console.log('Value Inserted');
		  res.send("Value Inserted.");
		  }
		});
});


module.exports = router;