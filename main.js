var MailListener = require('mail-listener2');
var config = require('./config').config;
var getDirections = require('./getDirections').getDirections;

var startedDate = new Date().getTime();

var mailListener = new MailListener({
	username: config.username,
	password: config.password,
	host: config.host, // imap host ex: imap.gmail.com
	port: 993, // imap port
	tls: true,
	connTimeout: 10000, // Default by node-imap
	authTimeout: 5000, // Default by node-imap,
	debug: console.log, // Or your custom function with only one incoming argument. Default: null
	tlsOptions: { rejectUnauthorized: false },
	mailbox: 'INBOX', // mailbox to monitor
	searchFilter: ['UNSEEN', ['SINCE', startedDate]], // Only listens to emails after starting app
	markSeen: true, // all fetched email willbe marked as seen and not fetched next time
	fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
	mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib.
	attachments: true, // download attachments as they are encountered to the project directory
	attachmentOptions: { directory: 'attachments/' }, // specify a download directory for attachments
});

mailListener.start(); // start listening

mailListener.on('server:connected', function() {
	console.log('imapConnected');
});

mailListener.on('server:disconnected', function() {
	console.log('imapDisconnected');
});

mailListener.on('error', function(err) {
	console.log('Error', err);
	console.log('*************');
});

mailListener.on('mail', function(mail, seqno, attributes) {
	let regNum = /<https:\/\/voice.google.com/gi;
	let regNum2 = /<https:\/\/www.google.com\/voice\/>([\s\S]+|.*)YOUR ACCOUNT/gi;
	let regRoute = /([\s\S]+|.*)[rR]outeme([\s\S]+|.*)/gi;

	if (mail.from && mail.text) {
		if ((regNum.test(mail.text) || regNum2.test(mail.text)) && regRoute.test(mail.text)) {
			let message = {
				html: mail.html,
				from: { name: mail.from[0].name, address: mail.from[0].address },
				subject: mail.subject,
				body: mail.text,
			};

			getDirections(message);
		} else {
			console.log('Not a route me message');
		}
	} else {
		console.log('Mail does not have a from location or a text');
	}
});
