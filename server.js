var express = require('express');
var exec = require('child_process').exec,
    child;
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');

var url = require("url");
var multipart = require("multipart");
var sys = require("sys");


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
	
	res.send();
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

app.get('/uploadFileToEC2', function(req, res){

	console.log("Hi");
	
	scpHandler = spawn('scp',['ccwang@ssh.cs.brown.edu:/home/ccwang', 'fail.jpg']);
	
	scpHandler.stdout.on('data', function(data){
			console.log("test");
            console.log(data);
            scpHandler.stdin.write('password');
            scpHandler.stdin.write('String.fromCharCode(13)');
    });
			
	res.send();
});


app.post('/upload', function(req, res){
	
	console.log('upload');
	upload_file(req, res);
	
});


app.listen(8080);
console.log('Listen on port 8080');


