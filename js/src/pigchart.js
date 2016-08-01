var d3 = require('d3');

// This modifies D3's formatters so that it uses custom SI prefixes
require('./d3-format-prefix');

var formatNumber = function(d, number){

/*
	The goal here is to smartly abbreviate the numbers so they can sit atop the bars without too much crowding
*/

	// The default formatting is just adding commas
	var retval = d3.format(",")(number);

	// No label if the number isn't a number (there will be some blanks but NO negative values in these datasets)
	if (number > 0){
		
		retval = d3.format(".3s")(number)
		// Lastly, if it is a currency, add a "$."
		if (d.type == 'currency'){
			retval = "$" + retval;
		}
		return retval;
	}
	// Normally there would be a return here, too, 
	// but we actually want to omit labels for non-number 
	// and/or zero labels labels. Thus, we return nothing.
}

var pigChart = function(){

		if (window.innerWidth > 767){
			var outerHeight = 400;
		} else if(window.innerWidth > 400){
			var outerHeight = 300;
		} else {
			var outerHeight = 250;
		}


	var margin = {top: 20, right: 20, bottom: 70, left: 40},
		outerWidth,
		width,
		height = outerHeight - margin.top - margin.bottom,
		transitionTime = 1000,
		labelTransitionTime = 150,
		x = d3.scale.ordinal(),
		y = d3.scale.linear(),
		y2 = d3.scale.linear();
		

	var component = function(selection, labels, category){
		selection.each(function(data) {
			let container = d3.select(this);
			
			outerWidth = container.node().offsetWidth;
			width = outerWidth - margin.left - margin.right;

			x.rangeBands([0,width], .1)
				.domain(data.map(d => d.year));

			y.range([0, height])
				.domain([0,d3.max(data, d => d.big + d.rest)]);

			// Because the SVG origin is upper left, the logic for all heights
			// and Y placements is inverted and unintuitive. Therefore, I'm using
			// this other scale, with an inverted range, so that the bars can
			// be drawn/placed using logic that makes sense to me and the scales
			// can have a zero baseline at the bottom.
			y2.range([height,0])
				.domain([0,d3.max(data, d => d.big + d.rest)]);


			var xAxis = d3.svg.axis()
				.scale(x)
				.tickSize(1)
				.orient('bottom');


			var myFormat = function(d){
				if (d>1000000000){

				} else {
					return d
				}
			}

			var getFormatter = function (dType) {
				if(dType.toLowerCase() == "currency"){

					return d3.format("$s");
				}
				return d3.format("s");
			}


			var yAxis = d3.svg.axis()
				.scale(y2)
				.tickSize(1)
				.tickFormat(getFormatter(data[0].type))
				.orient('left')
				// .tickFormat(d => formatValue(d));

			var chart = container;

			if(chart.select('svg').size() < 1){
				// this is a test for an existing chart, i.e. is this the first time we've 
				// needed a chart? If it is the first time, draw all the bars and axes, etc.
				// If it is not the first time, then we can skip this and jump right to the 
				// part where we size the bars using data. Since the first 
				
				container.append('div')
					.classed('overlays__sentence-container', true)
					.append('p')
						.classed('overlays__sentence', true);
				container.append('p')
					.classed('key',true)
					.html("<span class='box box--big'></span> Farms with 5,000+ pigs<span class='box box--rest'></span> All other farms");


				chart = container
					.append('svg')
						.attr("width", outerWidth)
						.attr("height", outerHeight)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
						.attr('class','chart-inner');
				var bar = chart.selectAll(".bar-wrapper")
						.data(data, d => d.year)
					.enter().append('g')
						.attr('class','bar-wrapper')
						.attr('transform', function(d,i){
							return "translate(" + x(d.year) + ",0)";
						});
				
				var bar = chart.selectAll(".bar-wrapper")
					.data(data);

				bar.selectAll('.bar--big')
						.data(d => [d])
					.enter()
					.append("rect")
						.attr("width", x.rangeBand())
						.attr('class', 'bar--big')
						.attr("y", height)
						.attr("height", 0);
		
				bar.selectAll(".bar--rest")
						.data(d => [d])
					.enter()
					.append("rect")
						.attr("width", x.rangeBand())
						.attr('class', 'bar--rest')
						.attr("y", height)
						.attr("height", 0);
					




				bar.selectAll('.bar-label--big')
						.data(d => [d])	
					.enter()
					.append("text")
						.attr('class', 'bar-label--big')
						// .attr("x", x.rangeBand()/2)
						.style('opacity', 0)
						// .attr("y", d => height - y(d.big) + 30)
						.attr("dy", "-.75em")
						.attr('text-anchor', 'middle');

				bar.selectAll('.bar-label--rest')
						.data(d => [d])
					.enter()
					.append("text")
						.attr('class', 'bar-label--rest')
						// .attr("x", x.rangeBand()/2)
						.attr("dy", "-.75em")
						.attr('text-anchor', 'middle')
						// .attr("y", d => height - y(d.rest) - y(d.big) + 30)
						.style('opacity', 0)

				chart.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")			
					.transition()
						.duration(transitionTime)
					.call(xAxis);
				
				chart.append("g")
					.attr("class", "y axis")
					.transition()
						.duration(transitionTime)
					.call(yAxis);

				d3.select('#pig-chart-container svg').append('text')
					.classed('overlays__sources', true)
					.attr('x',0)
					.attr('y', height + margin.top + margin.bottom/2 + 5)
					.attr('dy',"-.75em");
				
			} else {
				// This is at least the second time through, so all we 
				// need to do is resize the svg so it can be redrawn to fit 
				// it's container size. This accomodates the debounced redraw.
				chart.select('svg')
					.attr("width", outerWidth)
					.attr("height", outerHeight);
			}

			var rebars = chart.selectAll(".chart-inner .bar-wrapper").data(data, d => d.year)
				.attr('transform', function(d,i){
					return "translate(" + x(d.year) + ",0)";
				});

			// Size and transition the bars
			rebars.selectAll('.bar--big')
				.data(d => [d])
				.attr("width", x.rangeBand())
				.transition()
					.duration(transitionTime)
				.attr("y", d => height - y(d.big))
				.attr("height", d => y(d.big));
	
			rebars.selectAll('.bar--rest')
				.data(d => [d])
				.attr("width", x.rangeBand())
				.transition()
					.duration(transitionTime)
				.attr("y", d => (height - y(d.rest) - y(d.big)))
				.attr("height", d => y(d.rest));

		
			// Populate and place the text labels
			rebars.selectAll ('.bar-label--big')
				.data(d => [d])
				.attr("x", x.rangeBand()/2)
				.transition()
					.duration(labelTransitionTime)
					.each("start", function(){
						d3.select(this).style('opacity', 0)
					})
					.each("end", function(){
						d3.select(this).text( (d,i) => {
							return formatNumber(d, d.big);
						})
						// .attr("y", d => height - y(d.big) + 30);
					})
					.transition()
						.delay(transitionTime)
						.duration(labelTransitionTime)
					.style('opacity', 1)
					.attr("y", d => height - y(d.big) + 3);

			rebars.selectAll('.bar-label--rest')
				.data(d => [d])
				.attr("x", x.rangeBand()/2)
				.transition()
					.duration(labelTransitionTime)
					.each("start", function(){
						d3.select(this).style('opacity', 0)
					})
					.each("end", function(){
						d3.select(this).text( d => {
							return formatNumber(d, d.rest);
						})
						// .attr("y", d => height - y(d.rest) - y(d.big) + 30);						
					})
				.style('opacity', 0)
				.transition()
					.delay(transitionTime)
					.duration(labelTransitionTime)
				.style('opacity', 1)
				.attr("y", d => height - y(d.rest) - y(d.big) + 3);
				
			chart.select(".y.axis")
				.transition()
					.duration(transitionTime)
				.call(yAxis);
			
			chart.select(".x.axis")
				.call(xAxis);

			// HEADERS, ETC.

			d3.select('.overlays__sentence')
				.html(labels.sentence);

			d3.select('.overlays__sources')
				.text(labels.source);
		});
	};
	return component;
};

module.exports = pigChart;