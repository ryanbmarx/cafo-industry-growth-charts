// Formatting http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html


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
 	 		// Set the new category of data we want to see
			app._category = this.dataset.chart;

			// Send that category to the analytics method
			app.trackButtonClick(app._category);

			// Grab the labels/meta we need from button data-* attributes
			app._labels = {
				sentence:this.dataset.sentence, 
				source:this.dataset.source, 
				chart_type:this.dataset.chart
			};

			// Restyle buttons so the proper one is highlighted
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
PigsOverTimeChart.prototype.trackButtonClick = function(buttonChartData){
	console.log('tracing click', buttonChartData);
	var linkName = 'cafo-industry-charting';

	if (window.s) {
		s.linkTrackVars = "server,prop3,prop20,prop28,prop33,prop34,prop57,eVar3,eVar20,eVar21,eVar34,eVar35,eVar36,eVar37,eVar38,eVar39,eVar51";
		s.linkTrackEvents = "";
		s.prop3 = buttonChartData;
		s.eVar3 = buttonChartData;
		s.prop57 = linkName;
		s.tl(
        // Since we're not actually tracking a link click, use
        // true instead of `this`.  This also supresses a
        // delay
        true,
        // linkType
        // 'o' for custom link
        'o',
        // linkName
        linkName,
        // variableOverrides
        null
        );
	}
}

module.exports = PigsOverTimeChart;