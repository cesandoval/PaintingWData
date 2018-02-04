var nodemailer = require('nodemailer');

var email = process.env.USEREMAIL;
var password = process.env.EMAILPASSWORD; // Obtain the username and password somehow.

console.log("email: " + email);

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: password
    }
  });

module.exports.sendVerificationEmail = function(email, verificationLink) {
  
  var mailOptions = {
    from: '"Painting With Data Team" <' + email + '>',
    to: email,
    subject: 'Please confirm your account',
    html: 'Click the following link to confirm your account:</p><p>' + verificationLink + '</p>',
    text: 'Please confirm your account by clicking the following link: ${URL}'
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
      console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });

};

module.exports.sendVoxelEmail = function(email, userId) {
	var mailOptions = {
    	from: '"Painting With Data" <painting.with.data@gmail.com>', 
		to: email, 
    	subject: 'Done Processing Voxels', 
    	text: 'Done Processing Voxels', 
    	html: 'Done processing voxels access them here: http://paintingwithdata.com/voxels/' + userId
   	};

   	transporter.sendMail(mailOptions, function(error, info) {
    	if(error) {
      		console.log(error);
    	}
    	console.log('Message %s sent: %s', info.messageId, info.response);
  	});
};

module.exports.sendResetPasswordEmail = function(email, passwordLink) {
  var mailOptions = {
      from: '"Painting With Data" <painting.with.data@gmail.com>', 
    to: email, 
      subject: 'Reset Password', 
      text: 'Reset Password', 
      html: 'Click this link to reset your password: http://paintingwithdata.com/users/reset-password/' + passwordLink
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if(error) {
          console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    });

};


module.exports.sendLayerEmail = function(email, userId) {
  var mailOptions = {
      from: '"Painting With Data" <painting.with.data@gmail.com>', 
    to: email, 
      subject: 'Done Uploading Layer', 
      text: 'Done Uploading Layer', 
      html: 'Done uploading layer access it here: http://paintingwithdata.com/layers/' + userId
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if(error) {
          console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    });
};



