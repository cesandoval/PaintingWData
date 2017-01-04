var nodemailer = require('nodemailer');

var email = process.env.pdata_email;
var password = process.env.pdata_password; // Obtain the username and password somehow.
var transporter = nodemailer.createTransport(`smtps://${email}@gmail.com:${password}@smtp.gmail.com`);

module.exports.sendMail = function(mailOptions, callback){

	transporter.sendMail(mailOptions, function(err, info){
	    if(err){
	    	callback(err, null);
	        
	    }
	    else{
		    callback(null, info);
		}
	 
	});

}

