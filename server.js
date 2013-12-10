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
	    if(err) throw err;
	    console.log("The file was saved!");
	});
	
	res.send();
});


app.post('/LinearRegression', function(req, res){

	var fields = req.body;
	var files = req.files;
	var filenameCode = "demo.cpp"; 
	// Hard coding the command
	//~/tupleware/build$ make (compile the source code)
    //~/tupleware/build$ ./bin/test-ml  (Run the test_ml)   
	var buildCmd = 'ssh -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' +  fields.location + ' ' + '"cd ~/tupleware/build/; make"';
	var executeCmd = 'ssh -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' +  fields.location + ' ' + '"cd ~/tupleware/build/; ./bin/test-ml"';
	/*
var sshCommand = 'ssh -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' +  fields.location + ' ' + '"cat ' + fields.code_des  + filenameCode + '"';
	console.log(sshCommand);
*/
	console.log(buildCmd);
	console.log(executeCmd);
	
	child = exec(buildCmd, function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
		child = exec(executeCmd, function (error, stdout, stderr) {	   
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
	    	res.json(stdout.toString());
	    });
	});
	
});

app.post('/uploadFileToEC2', function(req, res){
	
	req.on('data', function(chunk) {
      	console.log("Received body data:");
    });
    
	console.log("Upload to EC2: Started");	
	console.log(req.body);
	console.log(req.files);
	
	var fields = req.body;
	var files = req.files; 
	var code = fields.code;
	var filenameCode = "demo.cpp";
		
	var targetPath = path.resolve('public/data/' + files.upload.name);
	var pemPath = path.resolve(files.pem.name);
	console.log(files.upload.name);
	console.log(targetPath);
		
	fs.writeFile(filenameCode, code, function(err) {
	    if(err) throw err;
	    console.log("The code was saved!");
		fs.rename(files.pem.path, pemPath, function(err){
	    	if (err) throw err;
	        // Change the file permission 
	        fs.chmod(pemPath, '600');
			fs.rename(files.upload.path, targetPath, function(err) {
				if (err) throw err;
				console.log("Upload completed!");
				// start to run the system call
				var scpCodefile = 'scp -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' + filenameCode  + ' ' + fields.location + ':' + fields.code_des;
				var scpDatafile = 'scp -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' + targetPath + ' ' + fields.location + ':' + fields.data_des;				
				var sshCommand = ' ';
				//var sshCommand = 'ssh -o StrictHostKeyChecking=no -i ' + files.pem.name + ' ' +  fields.location + ' ' + '"cat ' + fields.destination + files.upload.name + ' > ' + fields.destination +  '123' + files.upload.name + '"';
				console.log(scpCodefile);
				console.log(scpDatafile);
				console.log(sshCommand);
				child = exec(scpCodefile, function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    console.log('stderr: ' + stderr);
				    if (error !== null) { console.log('exec error: ' + error); }
				    child = exec(scpDatafile, function (error, stdout, stderr) {
				    	console.log('stdout: ' + stdout);
				    	console.log('stderr: ' + stderr);
						child = exec(sshCommand, function (error, stdout, stderr) {
						    console.log('stdout: ' + stdout);
						    console.log('stderr: ' + stderr);
						    if (error !== null) { console.log('exec error: ' + error); }
						    // finish running all the command
						    console.log("finished");
						    res.send();  	
						});
					});		    
				});
		     });   
	     });
	 });
     
});


app.listen(8080);
console.log('Listen on port 8080');
