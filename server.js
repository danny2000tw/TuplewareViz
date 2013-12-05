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

app.get('/scp', function(req, res){

	console.log("Hi");
	
	scpHandler = spawn('scp',['ccwang@ssh.cs.brown.edu:/home/ccwang', 'fail.jpg']);
	
	scpHandler.stdout.on('data', function(data){
			console.log("test");
            console.log(data);
            scpHandler.stdin.write('password');
            scpHandler.stdin.write('String.fromCharCode(13)');
    });
	
	/*
child = exec('scp fail.jpg ccwang@ssh.cs.brown.edu:/home/ccwang',
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
			    
	    res.json(stdout.toString());
	});
*/
		
	res.send();
});


app.post('/upload', function(req, res){
	
	console.log('upload');
	upload_file(req, res);
	
});


app.listen(8080);
console.log('Listen on port 8080');


function parse_multipart(req) {
    var parser = multipart.parser();

    // Make parser use parsed request headers
    parser.headers = req.headers;

    // Add listeners to request, transfering data to parser
    req.addListener("data", function(chunk) {
        parser.write(chunk);
    });

    req.addListener("end", function() {
        parser.close();
    });

    return parser;
}



function upload_file(req, res) {
    // Request body is binary
    req.setEncoding("binary");

    // Handle request as multipart
    var stream = parse_multipart(req);
    
    console.log(stream);
    
    var fileName = null;
    var fileStream = null;


    sys.debug("Started part, name = ");
    
    // Set handler for a request part received
    stream.onPartBegin = function(part) {
        sys.debug("Started part, name = " + part.name + ", filename = " + part.filename);

        // Construct file name
        fileName = "./uploads/" + stream.part.filename;

        // Construct stream used to write to file
        fileStream = fs.createWriteStream(fileName);

        // Add error handler
        fileStream.addListener("error", function(err) {
            sys.debug("Got error while writing to file '" + fileName + "': ", err);
        });

        // Add drain (all queued data written) handler to resume receiving request data
        fileStream.addListener("drain", function() {
            req.resume();
        });
    };
    
    
    // Set handler for a request part body chunk received
    stream.onData = function(chunk) {
        // Pause receiving request data (until current chunk is written)
        req.pause();

        // Write chunk to file
        // Note that it is important to write in binary mode
        // Otherwise UTF-8 characters are interpreted
        sys.debug("Writing chunk");
        fileStream.write(chunk, "binary");
    };
    
    
    // Set handler for request completed
    stream.onEnd = function() {
        // As this is after request completed, all writes should have been queued by now
        // So following callback will be executed after all the data is written out
        fileStream.addListener("drain", function() {
            // Close file stream
            fileStream.end();
            // Handle request completion, as all chunks were already written
            upload_complete(res);
        });
    };
}

function upload_complete(res) {
    sys.debug("Request complete");

    // Render response
    res.sendHeader(200, {"Content-Type": "text/plain"});
    res.write("Thanks for playing!");
    res.end();

    sys.puts("\n=> Done");
}

/*
 * Handles page not found error
 */
function show_404(req, res) {
    res.sendHeader(404, {"Content-Type": "text/plain"});
    res.write("You r doing it rong!");
    res.end();
}
