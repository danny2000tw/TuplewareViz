//<script src="http://d3js.org/d3.v3.js"></script>

window.addEventListener('load', function(){
	
	$("#LR").on('click', function() {execLinearRegression()} );


}, false);


function execLinearRegression() {
	//var code = $('textarea#code').val();
	var code = editor.getValue();
	//console.log(code);
	$.post( "/data", {code : code}, function( data ) {
		var req = new XMLHttpRequest();
		req.open('GET', '/LinearRegression', true);
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
				
				renderLinearRegression(generateLine(w0, w1, w2));
				//renderLinearRegression(JSON.parse(content));
			}
			
		}, false); 
		
		req.send(null);
	});
	
	
	
}


function generateLine(w0, w1, w2) {
	
	var data = [];
	var tmp = {};
	for( var x1 = -50 ; x1 <= 50 ; x1 = x1+0.1)
	{
		console.log(x1);
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


function renderLinearRegression(result) {

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%d-%b-%y").parse;
	
	/*
var x = d3.time.scale()
	    .range([0, width]);
*/
	
	var x = d3.scale.linear()
	    .range([0, width]);
	
	var y = d3.scale.linear()
	    .range([height, 0]);
	
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");
	
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
	
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
	    
	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var data = result;
	/*
d3.tsv.parse(result, function(d) {
		d.date = parseDate(d.date);
		d.close = +d.close;
		data.push(d);
	});
*/
		
	console.log(data);
	x.domain(d3.extent(data, function(d) { return d.date; }));
	y.domain(d3.extent(data, function(d) { return d.close; }));
	
	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height + ")")
	  .call(xAxis);
	
	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis)
	.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", ".71em")
	  .style("text-anchor", "end")
	  .text("Price ($)");
	
	svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);
        
    svg.append("path")
        .datum(data)
        .attr("class", "areaUp")
        .attr("d", areaUp);   
         
	svg.append("path")
	  .datum(data)
	  .attr("class", "line")
	  .attr("d", line);
	  

     
        
			
}
