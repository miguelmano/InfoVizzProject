import { setSelectedHike,getSelectedHike, getSelectedCountry, CP } from './main.js';
import { updateRadarPlot } from './radarChart.js';


var dots,xAxis,numTicksX,numTicksY , yAxis, x ,y, numTicksX, numTicksY, header;
var xVar = "length_3d";
var yVar = "moving_time_hours" 
const tooltip = d3.select(".tooltip");
var colorScale;

var tooltip2 = d3.select("body")
    .append("div")
    .attr('class','tooltipdiv')
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background-color", "green")
    .style("border-radius", "4px" );

function color(d) {
    let sc = getSelectedCountry();
    let sh = getSelectedHike();
    if (sh.includes(d)) { 
        if (sh[0] === d) { return CP[4]; }
        if (sh[1] === d) { return CP[5]; }
        if (sh[2] === d) { return CP[6]; }
     }
    if (sc.includes(d.country_name)) {
        if (sc[0] === d.country_name) { return CP[1]; }
        if (sc[1] === d.country_name) { return CP[2]; }
        if (sc[2] === d.country_name) { return CP[3]; }
    }
    else {return CP[0] }
}
function colorHighlight(d){
    let sc = getSelectedCountry();
    let sh = getSelectedHike();
    if (sh.includes(d)) { 
        if (sh[0] === d) { return CP[4]; }
        if (sh[1] === d) { return CP[5]; }
        if (sh[2] === d) { return CP[6]; }
     }
    if (sc.includes(d.country_name)) {
        if (sc[0] === d.country_name) { return CP[1]; }
        if (sc[1] === d.country_name) { return CP[2]; }
        if (sc[2] === d.country_name) { return CP[3]; }
    }
    else {return "lightcoral" }
}

function createScatterPlot(data) {
    const margin = { top: 25, right: 40, bottom: 60, left: 35 };
   
    colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain([...new Set(data.map(d => d.country_name))]);

    // Select the SVG element inside the .Scatter div
    const svg = d3.select(".Scatter__SVG")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const svgElement = d3.select(".Scatter__SVG").node();
    const { width: svgOriginalWidth, height: svgOriginalHeight } = svgElement.getBoundingClientRect(); // Get dimensions

    numTicksX = Math.floor(svgOriginalWidth / 50); 
    numTicksY = Math.floor(svgOriginalHeight / 50);

    data.forEach(d => {
      d[xVar] = +d[xVar];
      d[yVar] = +d[yVar];
    });
  
    x = d3.scaleLinear()
    .domain([d3.min(data, d => d[xVar]), d3.max(data, d => d[xVar])])
    .range([margin.left,svgOriginalWidth-margin.right-margin.left]);
  
    y = d3.scaleLinear()
      .domain([d3.min(data, d => d[yVar]), d3.max(data, d => d[yVar])])
      .range([svgOriginalHeight-margin.bottom-margin.top, margin.top]);


    
        // Add X axis
    xAxis = svg.append("g")
        .attr("transform", `translate(0,${svgOriginalHeight - margin.bottom -margin.top})`)
        .call(d3.axisBottom(x).ticks(numTicksX)) // Adjust tick count based on width
    // Add Y axis
    yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(numTicksY))

    //create the hike dots
    createDots(svg,data);

        // update x axis based on drop down selection
        d3.select("#attributeSelector").on("change", function () {
            // recover the option that has been chosen
            var selectedAttribute = d3.select(this).property("value")
    
            if(selectedAttribute === yVar){
                tooltip2.transition()
                .duration(200)
                .style("opacity", 1)
                .style("visibility", "visible");
                tooltip2.html("Choose another option for the axis") 
                    .style("left", d3.select("#attributeSelector").property("x"))
                    .style("bottom", "0px")
            }else{
                tooltip2.transition()
                .duration(200)
                .style("visibility", "hidden");
        
                updateScatterPlotX(selectedAttribute,data);  
            }
        });
          
        // update y axis based on drop down selection
        d3.select("#attributeSelectorLeft").on("change", function () {
            // recover the option that has been chosen
            var selectedAttribute = d3.select(this).property("value")
    
            if(selectedAttribute === xVar){
                tooltip2.transition()
                .duration(200)
                .style("opacity", 1)
                .style("visibility", "visible");
                tooltip2.html("Choose another option for the axis")
                    .style("left",  d3.select("#attributeSelectorLeft").property("x"))
                    .style("bottom", "0px")
            }else{
                tooltip2.transition()
                .duration(200)
                .style("visibility", "hidden");
                
                updateScatterPlotY(selectedAttribute,data);  
            }
        });
    
}



function createDots(container, data){


    dots = container.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d[xVar]))
    .attr("cy", d => y(d[yVar]))
    .attr("r", 2.5)
    .attr("fill", d=>color(d))  // Add fill color .attr("fill", d => colorScale(d.country))
    .attr("stroke", "black")           // Add stroke color (outline)
    .attr("stroke-width", 0.01)        
    .on("mouseover", (event, d) => {
        tooltip
            .style("border", "4px solid " + colorHighlight(d))
            .style("box-shadow", "inset 0 0 5px " + colorHighlight(d) + ", 0 0 5px grey")
            .style("opacity", 0.9)
            .html(`
                <strong>Name:</strong> ${d.name}<br>
                <strong>Length:</strong> ${d.length_3d}km<br>
                <strong>Elevation:</strong> ${d.min_elevation}m - ${d.max_elevation}m<br>
                <strong>Difficulty:</strong> ${d.diff}<br>
                <strong>Uphill:</strong> ${d.uphill}m
                <strong>Downhill:</strong> ${d.downhill}m<br>
                <strong>Duration:</strong> ${d.moving_time_hours}h
                <strong>Moving Time:</strong> ${d.moving_time_hours}h
                `)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px")
            
        // Change fill color and outline on hover
        d3.select(event.currentTarget) // Select the hovered circle
        .attr("fill", colorHighlight(d)) // Change fill color
        .attr("stroke", "black") // Change stroke color
        .attr("r",4)   // Change stroke color
        .attr("stroke-width", 1) // Increase stroke width
        .raise();
    })
    .on("mouseout", (event,d) => {
        tooltip
            .style("opacity", 0);

        d3.select(event.currentTarget) // Select the hovered circle
            .attr("r", getSelectedHike().includes(d) ? 4 : 2.5) // Reset radius based on selection
            .attr("fill", color(d)) // Reset fill color based on selection
            .attr("stroke", "black")    // Reset stroke color
            .attr("stroke-width", 0.01) 
    })
    .on("click", (event, d) => {
        setSelectedHike(d); 
        updateScatterPlotHighlight();
        console.log(d.difficulty);
    });
}

function updateScatterPlotHighlight() {
    dots.attr("fill", d=>color(d))
        .attr("r", d => getSelectedHike().includes(d) ? 4 : 2.5)
        .each(function(d) {
            if (getSelectedHike().includes(d)) {
                d3.select(this).raise(); // Bring the selected dot to the front
            }
        });
}

function updateScatterPlotX(selectedAttribute,data) {

    // run the updateChart function with this selected option
    data.forEach(d => {
        d[selectedAttribute] = +d[selectedAttribute];
        d[yVar] = +d[yVar];
    });

    //define new xVAR
    xVar=selectedAttribute;

    //change x axis domain
    x.domain([d3.min(data,d => d[selectedAttribute]), d3.max(data,d => d[selectedAttribute])]);

    xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(numTicksX));

    // Give the new data to update dots
    dots
        .data(data)
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(+d[selectedAttribute])})
        .attr("cy", function(d) { return y(+d[yVar]) });
}

function updateScatterPlotY(selectedAttribute,data) {

    // run the updateChart function with this selected option
    data.forEach(d => {
      d[xVar] = +d[xVar];
      d[selectedAttribute] = +d[selectedAttribute];
    });
    
    //define new yVar
    yVar=selectedAttribute
    
    //define new y axis domain
    y.domain([0, d3.max(data,d => d[selectedAttribute])])
    
    yAxis.transition().duration(1000).call(d3.axisLeft(y).ticks(numTicksY));
    
    // Give the new data to update dots
    dots
      .data(data)
      .transition()
      .duration(1000)
        .attr("cx", function(d) { return x(+d[xVar])})
        .attr("cy", function(d) { return y(+d[selectedAttribute]) });
    }


export { createScatterPlot,updateScatterPlotHighlight};
