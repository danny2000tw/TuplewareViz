var express = require('express');
var exec = require('child_process').exec,
    child;

// Set varable for library call
var app = express();

app.use(express.bodyParser()); 
app.use('/public', express.static(__dirname + '/public'));
//app.use(app.router);


var engines = require('consolidate');
app.engine('html', engines.hogan);
app.set('views', __dirname + '/view');


app.get('/', function(req,res){
	res.render('index.html');
});

app.listen(8080);
console.log('Listen on port 8080');

child = exec('cat view/data.tsv',
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
	});