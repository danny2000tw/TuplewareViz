var express = require('express');
var exec = require('child_process').exec,
    child;
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');
var url = require("url");
var multipart = require("multipart");
var sys = require("sys");
var path = require('path');
//var formidable = require('formidable');


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

app.post('/uploadFileToEC2', function(req, res){
	
	req.on('data', function(chunk) {
      	console.log("Received body data:");
      	//console.log(chunk.toString());
    });
    
	console.log("Upload to EC2: Started");	
	console.log(req.body);
	console.log(req.files);
	
	var fields = req.body;
	var files = req.files; 
		
	var targetPath = path.resolve(files.upload.name);
	var pemPath = path.resolve(files.pem.name);
	var scpCommand = 'scp -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' + files.upload.name + ' ' + fields.location + ':' + fields.destination;
	var sshCommand = 'ssh -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' + fields.location + ' ' + '"cat ' + fields.destination + files.upload.name + ' > ' + fields.destination +  '123' + files.upload.name + '"';
	console.log(scpCommand);
	console.log(sshCommand);
	
	fs.rename(files.pem.path, pemPath, function(err){
    	if (err) throw err;
        // Change the file permission 
        fs.chmod(pemPath, '600');
            
		fs.rename(files.upload.path, targetPath, function(err) {
			if (err) throw err;
			console.log("Upload completed!");
			console.log('It\'s saved!');
			child = exec(scpCommand, function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    
			    if (error !== null) {
			      console.log('exec error: ' + error);
			    }
				
				child = exec(sshCommand, function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) {
				      console.log('exec error: ' + error);
				    }
				    
				    res.end();  
				    							
				});	    
			});
	     });
	       
     });
     
});


app.listen(8080);
console.log('Listen on port 8080');
