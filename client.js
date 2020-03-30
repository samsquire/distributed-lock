var net = require('net')
var replace = require('stream-replace')
var client = net.connect({
  host: 'irc.freenode.net',
  port: '6667'
})
const {Transform} = require('stream')
var money = 1000;

var lockTaken = false;
const handler = new Transform({
    transform: (chunk, encoding, done) => {
	var allstr = chunk.toString().split("\r\n");
	for (var i  = 0 ; i < allstr.length ; i++) {
		var str = allstr[i];
		console.log(str);
		
		if (str.indexOf("PING") != -1) {
		client.write("PONG server\r\n");
		console.log("Handled ping");
		}
		if (str.indexOf("LOCK money") != -1) {
			lockTaken = true;
		}
		if (str.indexOf("RELEASE money") != -1) {
			lockTaken = false;
			// playWithMoney();
		}
		if (str.indexOf("MONEY") != -1) {
			splitted = str.split(" ")
			console.log(splitted);
			var newMoney = splitted[4].replace(":", "").replace("MONEY ", "")
			console.log("Difference is ", newMoney);
			money += parseInt(newMoney)
			console.log(money)
		}
		if (str.indexOf("checkmoney") != -1) {
		client.write("PRIVMSG #testbot :newamount " + money + "\r\n");
		}
	}
        done(null, str)
    }
})

client.pipe(handler).pipe(process.stdout)
process.stdin.pipe(replace('\n', '\r\n')).pipe(client)
client.write("PASS blah\r\n")
client.write("USER nodejsbot blah blah blah\r\n")
client.write("NICK nodejsbot" + process.argv[2] + "\r\n")
client.write("JOIN #testbot\r\n")

function random(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}


function playWithMoney() {
	if (lockTaken) {  console.log("Lock taken", money); return }
	client.write("PRIVMSG #testbot :LOCK money\r\n");
	if (random(1, 10) > 5) {
		sign = -1;
	} else {
		sign = 1;
	}
	var difference = sign * random(100, 300);
	money += difference;
	console.log(money);
	client.write("PRIVMSG #testbot :MONEY " + difference + "\r\n");
	client.write("PRIVMSG #testbot :newamount " + money + "\r\n");
	client.write("PRIVMSG #testbot :RELEASE money\r\n");
}

setTimeout(function () {
	setInterval(playWithMoney, 10000);
}, 10000);
