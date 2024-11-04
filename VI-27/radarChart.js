//// The radar chart inspired by Nadieh Bremer from VisualCinnamon.com ////////////////
import { getSelectedHike, setSelectedHike, getSelectedCountry,setSelectedCountry,removeHikeByName, CP } from './main.js';

let gData = null;
let CountryProfileData = null;
let oHike = null;
const allAxis = ["duration_hours", "length_3d", "difficulty", "downhill", "uphill"]; // Names of each axis

let svg, rScales, angleSlice, radarLine, tooltip,g;

const cfg = {
	w: 0,				//Width of the circle
	h: 0,				//Height of the circle
	margin: {top: 50, right: 10, bottom: 30, left: 30}, //The margins of the SVG
	levels: 3,				//How many levels or inner circles should there be drawn
	maxValue: 0, 			//What is the value that the biggest circle will represent
	labelFactor: 1.20, 	//How much farther than the radius of the outer circle should the labels be placed
	wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	opacityArea: 0.15, 	//The opacity of the area of the blob
	dotRadius: 6, 			//The size of the colored circles of each blog
	opacityCircles: 0.1, 	//The opacity of the circles of each blob
	strokeWidth: 3, 		//The width of the stroke around each blob
	roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
	color:  d3.scaleOrdinal().range(["#ffb3ba", "black", "#ffffba", "#baffc9", "#bae1ff"])	//Color function
   };

const difficultyMapping = {
    1: "T1 Valley hike",
    2: "T2 Mountain hike",
    3: "T3 Difficult Mountain hike",
    3.33: "T3+ Difficult Mountain hike",
    3.67: "T4- High-level Alpine hike",
    4: "T4 High-level Alpine hike",
    4.33: "T4+ High-level Alpine hike",
    4.67: "T5- Challenging High-level Alpine hike",
    5: "T5 Challenging High-level Alpine hike",
    5.33: "T5+ Challenging High-level Alpine hike",
    5.67: "T6- Challenging High-level Alpine hike",
    6: "T6 Expert-level Alpine hike",
    6.33: "T6+ Expert-level Alpine hike"
};

// Function to find the closest matching difficulty
function showDifficulty(nb) {
    // Get all keys from the mapping object
    const keys = Object.keys(difficultyMapping).map(Number);
    
    // Find the key with the smallest difference from `nb`
    const closestKey = keys.reduce((prev, curr) => 
        Math.abs(curr - nb) < Math.abs(prev - nb) ? curr : prev
    );
    
    // Return the mapped difficulty description
    return difficultyMapping[closestKey];
}

function colorB(d){
	const sc = getSelectedCountry();
	const sh = getSelectedHike().map(hike => hike.name);
	if(d.name === "All"){return CP[0];}
    if (sh.includes(d.name)) {
		if (sh[0] === d.name) { return CP[4]; }
		if (sh[1] === d.name) { return CP[5]; }
		if (sh[2] === d.name) { return CP[6]; }
	}
	if (sc.includes(d.name)) {
		if (sc[0] === d.name) { return CP[1]; }
		if (sc[1] === d.name) { return CP[2]; }
		if (sc[2] === d.name) { return CP[3]; }
	}
	else return "black";
	

}
function transformDataCountry(data) {
	return data.map(function(d) {
		return {
			name: d.country_name, // Include the name field
			values: [
				{ axis: "duration_hours", value: parseFloat(d.duration_hours) },
				{ axis: "length_3d", value: parseFloat(d.length_3d) },
				{ axis: "difficulty", value: parseFloat(d.difficulty) },
				{ axis: "downhill", value: parseFloat(d.downhill) },
				{ axis: "uphill", value: parseFloat(d.uphill) }
			]
		};
	});
}
function transformDataHike(data) {
	return data.map(function(d) {
		return {
			name: d.name, // Include the name field
			values: [
				{ axis: "duration_hours", value: parseFloat(d.duration_hours) },
				{ axis: "length_3d", value: parseFloat(d.length_3d) },
				{ axis: "difficulty", value: parseFloat(d.difficulty) },
				{ axis: "downhill", value: parseFloat(d.downhill) },
				{ axis: "uphill", value: parseFloat(d.uphill) }
			]
		};
	});
}
function createRadarChart( countryData, oneHike,CPData ) {


	if (CPData){ 
		CountryProfileData = CPData;
}


   // Get the height of the SVG element
    svg = d3.select(".Radar__SVG")
    var svgHeight = svg.node().getBoundingClientRect().height;
	var svgWidth = svg.node().getBoundingClientRect().width;
	var newX, newY;
	cfg.w = svgWidth - cfg.margin.left - cfg.margin.right;
	cfg.h = svgHeight - cfg.margin.top - cfg.margin.bottom;

    

	if (oneHike && oneHike.length > 0 ) {
        oHike = oneHike.map(hike => transformDataHike([hike])[0]);  // Transform multiple hikes
    } else {
        oHike =null;
    }

	var maxValues = allAxis.map(function (axis) {
		if (axis === "difficulty") {
			return 6.33; // Set a fixed value for the "difficulty" axis
		}
		if (axis === "length_3d") {
			return 85; // Set a fixed value for the "length_3d" axis
		}
		if (axis === "duration_hours") {
			return 80; // Set a fixed value for the "duration_hours" axis
		}
		if (axis === "uphill") {
			return 8000; // Set a fixed value for the "uphill" axis
		}
		if (axis === "downhill") {
			return 8000; // Set a fixed value for the "downhill" axis
		}
	});

    var total = allAxis.length ;                   // The number of different axes
	var radius = Math.min(cfg.w/2, cfg.h/2);     // Radius of the outermost circle
	var Format = d3.format('.2f');                   // Percentage formatting
	var angleSlice = Math.PI * 2 / total;
	
	
	// Create individual rScales for each axis
    rScales = allAxis.map((axis, i) => d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValues[i]]));


	//////////// Create the container SVG and g /////////////

	//Append a g element		
	g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	//FILTER--------------------------
	 //first glow
	{ var defs = svg.append("defs");
	 var filter = defs.append("filter")
		 .attr("id", "glow");
	 filter.append("feGaussianBlur")
		.attr("stdDeviation", "2.5")
		.attr("result", "coloredBlur");
	 var feMerge = filter.append("feMerge");
	 feMerge.append("feMergeNode")
		.attr("in", "coloredBlur");
	 feMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");
	 //insane glow when hovered
	 var hoverFilter = defs.append("filter")
	 .attr("id", "glow-hover");
 
	 hoverFilter.append("feGaussianBlur")
		.attr("stdDeviation", "6") // Increased glow
		.attr("result", "coloredBlur");
	 var feMergeHover = hoverFilter.append("feMerge");
	 feMergeHover.append("feMergeNode")
		.attr("in", "coloredBlur");
	 feMergeHover.append("feMergeNode")
		.attr("in", "SourceGraphic");  }
	
	//////////////////// Draw the axes //////////////////////
	//Wrapper for the grid & axes
	{var axisGrid = g.append("g").attr("class", "axisWrapper");
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");

	axis.append("g")
	.attr("class", "axisLabel")
	.each(function(d, i) {
		var tickValues = rScales[i].ticks(2);
        tickValues = tickValues.slice(1);
		if (i== 3 || i == 4) {
			var axis = d3.axisTop(rScales[i])
			.tickValues(tickValues)
			.tickSize(3)
			.tickFormat(d3.format(".0f"));	
		}
		else{
		var axis = d3.axisBottom(rScales[i])
			.tickValues(tickValues)
			.tickSize(3)
			.tickFormat(d3.format(".0f"));}
		
	
		d3.select(this)
            .attr("transform", function() {
                var angle = angleSlice * i * 180 / Math.PI - 90;
                return "translate(0,0) rotate(" + angle + ")";
            })
            .call(axis);
			
		if (i == 3 || i == 4) {
				d3.select(this).selectAll("text")
					.attr("transform", "rotate(180)")
					.attr("dy", "+2em")
					.attr("dx", "+1em" ) // Adjust the position of the text
					.style("text-anchor", "end");
			}
		d3.select(this).selectAll("ticks").attr("dy", "+2em")

	});	

	axis.append("text")
        .attr("class", "legendRadar")
        .style("font-size", "10px")
		.style("fill", "black")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i) { return rScales[i](maxValues[i] * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("y", function(d, i) { return rScales[i](maxValues[i] * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
        .text(function(d) {  
			if (d =="duration_hours")
			{return "Duration (h)"}
			else if (d =="length_3d")
			{return "Length (km) "}
			else if (d =="difficulty")
			{return "Difficulty "}
			else if (d =="uphill")
			{return "Uphill (m)"}
			else if (d =="downhill")
			{return "Downhill (m)"}
			return d; })
        .call(wrap, cfg.wrapWidth);

    }

	/// ici oon va vrm bien preparer la data
	const RealData = transformDataCountry([CountryProfileData[0]]); // on ajoute ALL
	let sc = getSelectedCountry();
	if (sc.includes("all")) {
		sc = [];
	}
	sc.forEach(country => {
		RealData.push(transformDataCountry([CountryProfileData.find(hike => hike.country_name === country)])[0]); //on rajoute les pays selectionnés
	})
	if(oHike){
	oHike.forEach(hike => {
		RealData.push(hike)
	})}

	const nbc = sc.length
	
	///////////// Draw the radar chart blobs ////////////////
	var radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed) // Change to curveLinearClosed or curveCardinalClosed based on your needs
        .radius(function(d, i) { return rScales[i](d.value); })
        .angle(function(d, i) { return i * angleSlice; });
	if (cfg.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed); // Use a cardinal curve for rounded strokes
	}	
	   
	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(RealData)
		.enter().append("g")
		.attr("class", "radarWrapper");
		
	//areas
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d, i) { return radarLine(d.values); })
		.style("fill", function(d, i) { return colorB(d); })
		.style("fill-opacity", 0)
		.style("stroke", "none")
		.style("pointer-events", "none")
		
	
    //lines
	blobWrapper
		.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d.values); })
		.style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d, i) { return colorB(d); })
		.style("fill", "none")
		.style("filter", "url(#glow)")
		.style("stroke-dasharray", function(d, i) { 
			if (nbc == 0) {
				return (i >= 1) ? "6" : "0";
			} else if (nbc == 1) {
				return (i >= 2) ? "6" : "0";
			} else if (nbc == 2) {
				return (i >= 3) ? "6" : "0";
			} else if (nbc == 3) {
				return (i >= 4) ? "6" : "0";
			}
		})
		.on('mouseover', function (event,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("stroke-width", cfg.strokeWidth-4 + "px")
				.style("filter", "url(#glow)");
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("stroke-width", cfg.strokeWidth +4 + "px")
				.style("filter", "url(#glow-hover)");
			d3.select(this.parentNode).select(".radarArea")
				.transition().duration(400)
				.style("fill-opacity", 0.2);
			tooltip.style("box-shadow", "inset 0 0 5px " + colorB(i)+ ", 0 0 5px grey")
			tooltip
				.style("opacity", 1);

			console.log("selected countries",getSelectedCountry())

			const tooltipContent = (() => {
				// Check if the current item's name is in the selected countries
				if (i.name == "All") {
					return '<strong>Country:</strong> All<br>'}
				if (getSelectedCountry().includes(i.name)) {
					return `<strong>Country:</strong> ${i.name}<br>`;
				} else {
					return `<strong>Hike Name:</strong> ${i.name}<br>`;
				}
			})(); // Immediately invoked function expression (IIFE) for clarity
	
			tooltip.html(tooltipContent)
				.style("top", (event.pageY + 10) + "px")  // Position below the cursor
				.style("left", (event.pageX + 10) + "px")
				.style("border", "4px solid " + colorB(i))
				
			
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarStroke")
			   .transition().duration(200)
			   .style("stroke-width", cfg.strokeWidth + "px")
			   .style("filter", "url(#glow)");
		    d3.selectAll(".radarArea")
               .transition().duration(400)
               .style("fill-opacity", 0);
			tooltip
			   .style('opacity', 0);
				
		});

		
	
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = '.radarCircle.hovered { fill-opacity: 1; r: ' + (cfg.dotRadius + 2) + '; }';
	document.getElementsByTagName('head')[0].appendChild(style); 

	//////// Append invisible circles for tooltip ///////////

	{var defs = svg.append("defs");
	var radialGradient = defs.append("radialGradient")
		.attr("id", "radial-gradient")
		.attr("cx", "50%")
		.attr("cy", "50%")
		.attr("r", "50%")
		.attr("fx", "50%")
		.attr("fy", "50%");

	radialGradient.append("stop")
		.attr("offset", "15%")
		.attr("stop-color", "black")
		.attr("stop-opacity", 1);

	radialGradient.append("stop")
		.attr("offset", "15%") // Faster transition
		.attr("stop-color", "black")
		.attr("stop-opacity", 0.1); // Slightly lighter
	
	radialGradient.append("stop")
		.attr("offset", "60%") // Faster transition
		.attr("stop-color", "black")
		.attr("stop-opacity", 0.05); // Even lighter

	radialGradient.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", "black")
		.attr("stop-opacity", 0);}
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(RealData)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarCircle")
		.data(function(d,i) { 
			return d.values.map(value => ({ ...value, originalData: d }));  })
		.enter().append("circle")
		.attr("class", function(d, i, j) { return "radarCircle " + "radarCircle-" + j; })
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScales[i](d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScales[i](d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "url(#radial-gradient)") // Apply the radial gradient
		.style("pointer-events", "all")
		.on("mouseover", function(event,i,j) {
			
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
			d3.select(this).transition().duration(200).attr("r", cfg.dotRadius*3)
					
			tooltip
				.style("opacity", 1)
			if(i.axis === "difficulty"){
				tooltip.html(
					"<b>" + i.axis + "</b>: " + Format(i.value)+"<br>" + showDifficulty(i.value) )
					.style("top", (event.pageY + 10) + "px")  // Position below the cursor
					.style("left", (event.pageX + 10) + "px")
					.style("border", "4px solid " + colorB(i.originalData))
					.style("box-shadow", "inset 0 0 5px " + colorB(i.originalData)+ ", 0 0 5px grey");
					}
			else{
			tooltip.html(
				"<b>" + i.axis + "</b>: " + Format(i.value))
				.style("top", (event.pageY + 10) + "px")  // Position below the cursor
				.style("left", (event.pageX + 10) + "px")
				.style("border", "4px solid " + colorB(i.originalData))
				.style("box-shadow", "inset 0 0 5px " + colorB(i.originalData)+ ", 0 0 5px grey");
			}
		})
		.on("mouseout", function(){
			tooltip
				.style("opacity", 0);
			d3.select(this).transition().duration(200).attr("r", cfg.dotRadius*1.5)
			
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip =  d3.select("#tooltip"); /* g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);*/
	
	/////////////////// Helper Function /////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	


//here i will create the buttons for the hikes
const he = (svgHeight )/7;
const buttonGroup = svg.append("g")
        .attr("transform", `translate(${0}, ${4.4*he})`); // Adjust position as needed

    // Create buttons based on oHike dat
    if (oHike) {
        oHike.forEach((hik, index) => {
			const buttonRadius = 9; // Radius of the circle
            const cx = buttonRadius; // Center x position
            const cy = index * (he*0.95) ;
            buttonGroup.append("circle")
                .attr("cx", cx)
				.attr("cy", cy)
				.attr("r", buttonRadius)
                .attr("fill", CP[index+4]) // Button color
                .attr("rx", 5) // Rounded corners
                .attr("ry", 5) // Rounded corners
				.style("filter", "url(#glow)")
				.style("cursor", "pointer") // Change cursor on hover
                .on("click", () => {
                    // Add your button click handling logic here
					const sh = getSelectedHike(); // Get the selected hikes
                    const url = sh[index].url; // Assuming `hike` has a `url` property
					window.open(url, "_blank"); 
                });

			buttonGroup.append("text")
				.attr("x", cx) // Center text in circle
				.attr("y", cy + 5) // Adjust y position to center the text vertically
				.attr("text-anchor", "middle") // Center the text
				.attr("font-size", "16px")
				.style("cursor", "pointer")
				.style("pointer-events", "invisible") // Font size
				.attr("fill", "white") // Text color
				.text("?") // The question mark
				.on("click", () => {
                    // Add your button click handling logic here
					const sh = getSelectedHike(); // Get the selected hikes
                    const url = sh[index].url; // Assuming `hike` has a `url` property
					window.open(url, "_blank"); 
                });
		});
    }

	
}//RadarChart


//-----------UPDATEEEEEEEEE----------//////

function updateRadarPlot() {
	const sHike = getSelectedHike();
    if (sHike.length === 0) {
		d3.select(".Radar__SVG").selectAll("*").remove()
	    createRadarChart(null, [],null);
	} // Ensure selectedHike is defined
    else{
		d3.select(".Radar__SVG").selectAll("*").remove()
		createRadarChart(null, sHike, null);}
    // Update the radar plot with the selected hike's data

}


//ca n'as plus rien avoir avec le radar la mon frere

function truncateText(text) {
    const maxLength = 25; // Set the maximum length to 35 characters

    // Check if the text length exceeds maxLength
    if (text.length > maxLength) {
        return text.slice(0, maxLength - 3) + "..."; // Truncate and add "..."
    }
    return text; // Return the original text if it fits
}

function createLegend(){
const margin = {top: 15, right: 10, bottom: 15, left: 15};
const spacing = 5;

// SVG dimensions
const svgHeight = d3.select(".Radar_Legend__SVG").node().getBoundingClientRect().height;
const svgWidth = d3.select(".Radar_Legend__SVG").node().getBoundingClientRect().width;
const rectHeight = (svgHeight -margin.top -margin.bottom - 6*spacing ) / 7 ; // Divide height equally for 7 spots

// Data structure for the 7 spots
let sc = getSelectedCountry();
if (sc.includes("all")) {
    sc = [];
}
let sh = getSelectedHike();
let spotsData = [
	{ label: "All Hikes", type: "average", color: CP[0] }, // Default color for average
	...sc.map((country, i) => ({ label: country, type: "country", color: CP[i+1] })), // Colors for countries
	...Array(3 - sc.length).fill({ label: "No Country Selected", type: "placeholder", color: "#f0f0f0" }), // Light grey for placeholders
	...sh.map((hike, i) => ({ label: hike.name, type: "hike", color: CP[i+4] })), // Colors for hikes
	...Array(3 - getSelectedHike().length).fill({ label: "No Hike Selected", type: "placeholder", color: "#f0f0f0" }) // Light grey for no hike
];

// Create the SVG
let svg = d3.select(".Radar_Legend__SVG")

const groups = svg.selectAll(".Radar_Legend__Group")
        .data(spotsData, (d,i) => i); // Use label as the key

    // Enter selection: create new groups
    const groupsEnter = groups.enter()
        .append("g")
        .attr("class", "Radar_Legend__Group")
        .attr("transform", (d, i) => `translate(${margin.left}, ${(i * (rectHeight + spacing)) + margin.top})`); // Position the group
    // Append rectangles to the groups
    groupsEnter.append("rect")
        .attr("class", "Radar_Legend__Rect")
        .attr("width", svgWidth - 20)
        .attr("height", rectHeight - spacing)
        .attr("rx", 10)
        .attr("ry", 10)
		// .attr("stroke", (d,i)=>{if (i>=4) return "#f0f0f0"; else "none"})
		.attr("stroke", d3.color("#f0f0f0").darker(0.1))
		.attr("stroke-width", "3")
		.attr("stroke-dasharray", (d,i)=>{if (i>3) return "6"; else "0"})

    // Append text to the groups
    groupsEnter.append("text")
        .attr("class", "Radar_Legend__Text")
        .attr("x", 10) // Align text to the left
        .attr("y", rectHeight / 2 - spacing) // Center vertically
        .attr("dy", ".35em") // Adjust for centering text
		.text(d => truncateText(d.label)) // Truncate long text


	groupsEnter.on("mouseover", function(d,i) {
			// Highlight the rectangle when hovering over either the rectangle or text
			d3.select(this).select("rect").style("fill", (d)=> d3.color(d.color).darker(0.5));
		})
		.on("mouseout", function(d,i) {
			// Reset the rectangle color on mouse out
			d3.select(this).select("rect").style("fill", (d)=> d.color);
		})
		.on("click", function(d,i) {
			    const n = i.label;
				if (n === "All Hikes") {
					setSelectedCountry("all");
				}
				const gs = getSelectedCountry();
				if (gs.includes(n)) {
					setSelectedCountry(n);
					return;
				}
				const sh = getSelectedHike().map(hike => hike.name);
                
				if (sh.includes(n)) {
					removeHikeByName(n);	
					return;
				}
		});
    
    
    // Update selection: update existing groups
    const groupsUpdate = groupsEnter.merge(groups);

    // Update rectangles in existing groups
    groupsUpdate.select(".Radar_Legend__Rect")
	    .transition()
		.duration(500)
        .style("fill", d => d.color) // Update fill color
		.attr("stroke", d => d3.color(d.color).darker(-0.3))

    // Update text in existing groups
    groupsUpdate.select(".Radar_Legend__Text")
		.transition()
		.duration(500)
		.attr("fill", d => d.type === "placeholder" ? "lightgrey" : "black")
		.text(d => truncateText(d.label)) // Truncate long text
        

    // Exit selection: remove old groups
    groups.exit().remove();
}


export { createRadarChart ,updateRadarPlot, createLegend};