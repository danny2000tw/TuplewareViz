var express = require('express');

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