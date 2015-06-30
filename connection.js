var telnet = require('telnet-client');


function Connection(ip, username, password){
	this.ip = ip;
	this.username = username;
	this.password = password;

	this.status = {};

	this._update_status = function (){

	}

	this.run_command = function (command, callback){
		var connection = new telnet();

		var params = {
			host: this.ip,
			username: this.username,
			password: this.password,
			shellPrompt: /(invalid username \/ password|>)/,
			// port: 23,
			timeout: 5000,
			// removeEcho: 4
			loginPrompt: "enter user name:",
			passwordPrompt: "enter password:"
		};

		connection.on('ready', function(prompt) {
			if(prompt.indexOf("invalid username / password") !== -1){
				connection.end();
				throw "Bad username/password";
			}
			connection.exec(command, {
				shellPrompt: '(.*)> $',
			}, function (r){
				connection.end();
				callback(r);
			});
		});

		connection.on('timeout', function() {
			connection.end();
			throw "Command failed, timeout exceeded";
		});

		connection.on('error', function(data) {
			throw data;
		});
		connection.connect(params);
	};

	this.power_status = function (p){
		this.run_command("pshow", function (response){
			var regex = new RegExp("0" + p + ".*?\\|.*?\\|.*?(ON|OFF)", 'gm');

			var data = regex.exec(response)[1];

			console.log(data);
		});
	};
}

module.exports = Connection;
