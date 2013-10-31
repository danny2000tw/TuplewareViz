var express = require('express');
var exec = require('child_process').exec,
    child;
var fs = require('fs');
var http = require('http');

// Set varable for library call
var app = express();

app.use(express.bodyParser()); 
app.use('/public', express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/css'));
//app.use(app.router);


var engines = require('consolidate');
app.engine('html', engines.hogan);
app.set('views', __dirname + '/view');

app.get('/', function(req,res){
	
	res.render('index.html');
});

app.post('/data', function(req,res){
	var code = req.body.code;
	fs.writeFile("data.tsv", code, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	});
});


app.get('/LinearRegression', function(req, res){

	// return a ChildProcess object
	child = exec('cat data.tsv',
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
			    
	    res.json(stdout.toString());
	});
	
});


app.listen(8080);
console.log('Listen on port 8080');

