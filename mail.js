var nodemailer = require('nodemailer');
var config = require('./config').config;
var htmlToText = require('nodemailer-html-to-text').htmlToText;

const transporter = nodemailer.createTransport({
	service: config.service,
	auth: {
		user: config.email,
		pass: config.password,
	},
});

exports.sendMail = (info) => {
	console.log('Info', info);
	let routeInfo = `RouteMe Travel Info: 
                     Duration: ${info.builder.formatTime} 
                     Distance: ${info.builder.distance.slice(0, info.builder.distance.indexOf('mi'))} miles 
                     -------------------------------------------------------
                     </p>`;
	let formatted = routeInfo + `Directions <br />`;
	let step;
	for (let i = 0; i < info.builder.narratives.length; i++) {
		step = info.builder.narratives[i];
		formatted += `(${i + 1}) ${step}  <br />---`;

		if (i == info.builder.narratives.length - 1) {
			formatted += '</p>';
			console.log('Done', formatted);
			let mailOptions = {
				from: config.email,
				to: info.from.address,
				subject: 'Direction',
				html: formatted,
			};
			transporter.use(
				'compile',
				htmlToText({
					preserveNewlines: true,
				})
			);
			transporter.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
		}
	}
};

exports.sendErrorMsg = (contain) => {
	let formatted = `<p>${contain.message}</p>`;
	console.log('Done', formatted);
	let mailOptions = {
		from: config.email,
		to: contain.info.from.address,
		subject: 'Direction',
		html: formatted,
	};
	transporter.use(
		'compile',
		htmlToText({
			preserveNewlines: true,
		})
	);
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
};
