
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
var express = require('express');
var index = express.Router();
var crypto = require('crypto');

var mysql = require('mysql');

var con = mysql.createConnection({
	  host: "healthcare.cjedykpuszoe.us-west-1.rds.amazonaws.com",
	  user: "healthcare",
	  password: "healthcare",
	  database: "healthcare"
	});

var secretKey = 'v65rr8byhrf29q8dhbci7hec67gqod';


index.get('/', function(req, res) {
	res.render("loginPage");
});


index.post('/login', function(req, res) {	
	console.log("came here" +JSON.stringify(req.body));
	var loginEmail = req.body.loginEmail;
	var loginPassword = req.body.loginPassword;
	var query  = 'SELECT password,fname,lname FROM userdetails WHERE email=?';

		con.query(query,[loginEmail],function(err,rows){
			console.log(rows);
			if(err) {
				res.render("loginPage",{"LoginMessage":"CNMM Server Error. Please try again later."});
			}
			else{
				if(rows.length>0){
					var hash = crypto.createHmac("md5",secretKey) .update(loginPassword).digest('hex');
					if(hash!=rows[0].password)
						res.render("loginPage",{"LoginMessage":"Email and Password did not match."});
					else{
						res.render("dataPage", {"fname":rows[0].fname, "lname":rows[0].lname});
					}
						
				}
				else{
					res.render("loginPage",{"LoginMessage":"Email is not registered to CNMM. Do you want to Register?"});
				}
				
			}
		});
});


index.post('/loginMobile', function(req,res){
	console.log("into mobile Login: " +JSON.stringify(req.body));
	
	var useremail = req.body.pid;
	var password = req.body.password;
	console.log("useremail: "+useremail);
	console.log("PAss: "+password);
	
	var query  = 'SELECT * FROM userdetails WHERE u_email=? and u_password=?';

		con.query(query,[useremail, password],function(err,rows){
			console.log(query);
			console.log(rows);
			if(err) {
				res.send('Server Error...!');
//				res.render("loginPage",{"LoginMessage":"CNMM Server Error. Please try again later."});
			}
			else{
				if(rows.length>0){
					//var hash = crypto.createHmac("md5",secretKey) .update(loginPassword).digest('hex');
//					if(hash!=rows[0].password){
					if(password==rows[0].u_password){
//						res.render("index", { title: 'Bad credentials' });
						res.send('Name: '+rows[0].u_fname);
//						res.render("loginPage",{"LoginMessage":"Email and Password didnot match."});						
					}
					else{
						res.send('Name: '+rows[0].u_fname);
//						res.render("dataPage", {"fname":rows[0].fname, "lname":rows[0].lname});
					}
						
				}
				else{
					res.send("not registered");
//					res.render("loginPage",{"LoginMessage":"Email is not registered to CNMM. Do you want to Register?"});
				}
				
			}
		});
	
});


index.post('/register', function(req, res) {
	console.log("came here" +JSON.stringify(req.body));
	var firstName = req.body.firstname;
	var lastName = req.body.lastName;
	var dob = req.body.date;
	var email = req.body.email;
	var password = req.body.password;
	
	var hash = crypto.createHmac("md5",secretKey) .update(password).digest('hex');
	
	var employee = { fname: firstName, lname: lastName,  email:email , password:hash, dob: dob};
	
	con.query('INSERT INTO userdetails SET ?', employee, function(err,result){
		  if(err) {
			  console.log(err);
			  if(JSON.stringify(err).indexOf("ER_DUP_ENTRY")>=0)
				  res.render("loginPage",{"pagemessage":'User Registration Error!! Account already exist with given Email id.'});
			  else
				  res.render("loginPage",{"pagemessage":'User Registration Error!! Please try again later'});
		  }else{
		  console.log('Last insert ID:', result.insertId);
		  res.render("loginPage",{"pagemessage":'User Registration Completed!! Please Login.'});
		  }
		});
	
	

});


index.post('/emailTempPassword', function(req, res) {
	var statusMessage;
	var emailId = req.body.email;
	var query  = 'SELECT count(*) as count FROM userdetails WHERE email=?'

		con.query(query,[emailId],function(err,rows){
			if(err) {
				status="INTERNAL_SERVER_ERROR";
				res.send(status);
			}
			else{
				if(rows[0].count>0){
					var tempPassword = randomstring.generate(7);
					var transporter = nodemailer.createTransport({
						  service: 'Gmail',
						  auth: {
						    user: 'networkloggerinfrateam@gmail.com',
						    pass: 'rcraakgnpxcqrflz'
						  }
						});

					var mailOptions = {
						    from: 'networkloggerinfrateam@gmail.com', // sender address
						    to: emailId, // list of receivers
						    subject: 'Network Logger Infra Team: Password Reset', // Subject line
						    html: 'Hi,<br><br> Please use this temporary password to login:'+tempPassword+'<br><br>Thanks,<br>Network Logger Infra Team '// html body
						};
					
					transporter.sendMail(mailOptions, function(error, info){
					    if(error){
					    	status="INTERNAL_SERVER_ERROR";
					    	res.send("INTERNAL_SERVER_ERROR");
					    }
					    res.status(200).send("OK");
					});
					
				}else
				{
					status="NOT_FOUND";
					res.send(status);
				}
			}
		});
});


module.exports = index;
module.exports = index;