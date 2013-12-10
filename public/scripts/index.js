//<script src="http://d3js.org/d3.v3.js"></script>

window.addEventListener('load', function(){
	
	//generateLine(0.207483, -0.653133, -0.720777)
	//generateLine(-0.00000977639, -0.007123, 0.000739545)
	// For testing 
	//$("#LR").on('click', function() {renderLinearRegression(generateLine(0.207483, -0.653133, -0.720777))} );
	$("#scp").on('click', function() {uploadFileToEC2()} );
	$('#uploadForm').on('submit', uploadFileToEC2);
	
	
	
}, false);


function uploadFileToEC2(e) {
	
	e.preventDefault();
	
	// send it to the server 
	var req = new XMLHttpRequest();
	var fd = new FormData(document.getElementById('uploadForm'));
	
	var code = editor.getValue();
	fd.append('code',code);
	
	console.log(fd);
	
	req.open('POST', '/uploadFileToEC2', true);
	console.log("call server");
	req.addEventListener('load', function(e){
		if(req.status == 200)
		{
			$('#uploadmsg').html('<h1>Upload finished! Executing the code....</h1>');
			execLinearRegression();
		}
	
	} , false);
	
	req.send(fd);
	
	$('#uploadmsg').html('<h1>Uploading files to EC2.....</h1>');	
}


function execLinearRegression() {

	var fd = new FormData(document.getElementById('uploadForm'));
	console.log("YEs!");
	console.log(fd);
	
	var req = new XMLHttpRequest();
	req.open('POST', '/LinearRegression', true);
	req.addEventListener('load', function(){
	
		if(req.status == 200)
		{
			var content = req.responseText;
			// reverse stingify function 
			
			var res = JSON.parse(content).split(",");
			console.log(res);
			
			w0 = parseFloat(res[0]);
			w1 = parseFloat(res[1]);
			w2 = parseFloat(res[2]);
			
			console.log(w0);
			console.log(w1);
			console.log(w2);
			
			renderLinearRegression(generateLine(w0, w1, w2));
			//renderLinearRegression(JSON.parse(content));
			$('#uploadmsg').html('<h1>Finished!</h1>');	
		}
	
	}, false); 
	
	req.send(fd);
}



function generateLine(w0, w1, w2) {
	
	var data = [];
	var tmp = {};
	//for( var x1 = -0.13 ; x1 <= 0.13 ; x1 = x1+0.01)
	//for( var x1 = -1 ; x1 <= 1.2; x1 = x1+0.01)
	for( var x1 = -2 ; x1 <= 2 ; x1 = x1+0.1)
	{
		//console.log(x1);
		x2 = (-w0 - w1*x1)/w2; 	
		data.push(createPoint(x1, x2));	
	}
	
	return data;
}


function createPoint(x1, x2) {
	var tmp = {};
	tmp.date = x1;
	tmp.close = x2;
	return tmp; 
}


function createDataPoint(label, x, y) {
	var tmp = {};
	tmp.label = label;
	tmp.x = x;
	tmp.y = y;
	return tmp; 
}

function renderLinearRegression(result) {

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%d-%b-%y").parse;
		
	var x = d3.scale.linear()
	    .range([0, width]);
	
	var y = d3.scale.linear()
	    .range([height, 0]);
	
	var color = d3.scale.category10();
	
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");
	
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
	
/*
	var area = d3.svg.area()
	    .x(function(d) { return x(d.date); })
	    .y0(height)
	    .y1(function(d) { return y(d.close); });
	
	var areaUp = d3.svg.area()
	    .x(function(d) { return x(d.date); })
	    .y0(0)
	    .y1(function(d) { return y(d.close); });
	    
	var line = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.close); });
*/
	    
	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var data = result;
	var fileName = $('#uploadFileName').val().split('\\').pop();
	console.log(fileName);
	
	
	
	d3.text("/public/data/" + fileName, function(error, text) {
		var pointsData = d3.csv.parseRows(text).map(function(row) {
			return row.map(function(value) {
				// conver all the elements to number 
				return +value;
			});
		});
		
		// Create data points
		var points = [];
		var i = 0;
		pointsData.forEach(function(d) {
			points.push(createDataPoint(d[0], d[1], d[2]));
		});
			
		//x.domain(d3.extent(data, function(d) { return d.date; }));
		//y.domain(d3.extent(data, function(d) { return d.close; }))
		x.domain(d3.extent(points, function(d) { return d.x; })).nice();
		y.domain(d3.extent(points, function(d) { return d.y; })).nice();
		
		
/*
		var area = d3.svg.area()
		    .x(function(d) { return x(d.date); })
		    .y0(height)
		    .y1(function(d) { return y(d.close); });
		
		var areaUp = d3.svg.area()
		    .x(function(d) { return x(d.date); })
		    .y0(0)
		    .y1(function(d) { return y(d.close); });
*/

		    
/*
		    var area = d3.svg.area()
		    .x1(function(d) { return x(d.date); })
		    .x0(width)
		    .y(function(d) { return y(d.close); });
		
		var areaUp = d3.svg.area()
		    .x1(function(d) { return x(d.date); })
		    .x0(0)
		    .y(function(d) { return y(d.close); });
*/
		    
		var line = d3.svg.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.close); });		
		
		svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis)
		 .append("text")
		  .attr("class", "label")
		  .attr("x", width)
		  .attr("y", 30)
		  .style("text-anchor", "end")
		  .text("X"); 
		
		svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", -50)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("Y");
		
		// render the decision boundary
/*
		svg.append("path")
		    .datum(data)
		    .attr("class", "area")
		    .attr("d", area);
		    
		svg.append("path")
		    .datum(data)
		    .attr("class", "areaUp")
		    .attr("d", areaUp);   
*/
		     
		svg.append("path")
		  .datum(data)
		  .attr("class", "line")
		  .attr("d", line);	
		 
		// render the points
		svg.selectAll(".dot")
				 .data(points)
			.enter().append("circle")
			  .attr("class", "dot")
			  .attr("r", 3.5)
			  .attr("cx", function(d) { return x(d.x); })
			  .attr("cy", function(d) { return y(d.y); })
			  .style("fill", function(d) { return color(d.label); });    
	});
		
		
}
