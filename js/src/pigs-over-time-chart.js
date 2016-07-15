// Formatting http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html
// TODO: Add dynamic chart title, y-axis label
// TODO: Fill out the stubbed legend method
// TODO: Figure out the redraw function

var $ = require('jquery');
var d3 = require('d3');
var pigChart = require('./pigChart');
var debounce = require('lodash/debounce');

var PigsOverTimeChart = function(options){
	
	var app = this;
	app.options = options;
	app.data = options.data;
	app._category = options.category;
	app._labels = "";
	app.setEventHandlers(app.options.buttons, app.options.mobileMenu);	
	app.chart = pigChart();
}

PigsOverTimeChart.prototype.setEventHandlers = function(buttons, mobileMenu){
	var app = this;
	var forEach = Array.prototype.forEach;
	forEach.call(buttons, button => {
		button.addEventListener('click', function(e){
 	 		e.preventDefault();
 	 		// update choropleth map base on selected button/data- attribute
			app._category = this.dataset.chart;
			app._labels = {
				header:this.dataset.header, 
				subheader:this.dataset.subheader, 
				sentence:this.dataset.sentence, 
				source:this.dataset.source, 
				chart_type:this.dataset.chart
			};
			forEach.call(app.options.buttons, button => {
				button.classList.remove('active');
			});
			this.classList.add('active');
			app.draw();
 	 	}, false);
	});
}

PigsOverTimeChart.prototype.initResizeHandler = function(){
	d3.select(window).on('resize', this.draw())
}

PigsOverTimeChart.prototype.draw = function(){
	var app = this;
	
	// In NGUX, when the window.width < 420, the iframe is set to 100% width. 
	// To keep everything aligned with the story, we need 20px padding at this point.
	if(window.innerWidth < 420){
		document.getElementsByClassName('pigchart')[0].style.padding = '0 20px';
	} else {
		document.getElementsByClassName('pigchart')[0].style.padding = '0';
	}
	// Draw the chart use an app variable to define the data
	d3.select(app.options.container)
		.datum(app.selectData(app._category, app.data))
		.call(app.chart, app._labels, app._category);

	// After drawing the chart, we want to make sure to debounce the redraw
	d3.select(window).on('resize',debounce(function(){
		app.draw();
	}, 300));
	return app;
}

PigsOverTimeChart.prototype.selectData = function(category, data){
	return data.map(d => {
		return {
			year: d.year,
			type: d[category].type,
			big: d[category].big,
			rest: d[category].rest
		};
	});
}


module.exports = PigsOverTimeChart;