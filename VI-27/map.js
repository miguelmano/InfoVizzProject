import { setSelectedHike,getSelectedHike,setSelectedCountry,getSelectedCountry,CP } from './main.js';
const worldAtlasURL = 'https://unpkg.com/visionscarto-world-atlas@0.1.0/world/110m.json';
const countriesWithHikes = ['Albania', 'Andorra', 'Argentina', 'Armenia', 'Austria', 'Belgium',
    'Bosnia and Herz.', 'Bulgaria', 'Canada', 'Chile', 'China',
    'Costa Rica', 'Croatia', 'Czechia', 'Ecuador', 'Faroe Islands',
    'France', 'Georgia', 'Germany', 'Greece', 'Greenland', 'Hungary',
    'Iceland', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kosovo',
    'Liechtenstein', 'Monaco', 'Montenegro', 'Morocco', 'Nepal',
    'Netherlands', 'New Zealand', 'North Macedonia', 'Norway',
    'Palestine', 'Poland', 'Romania', 'Russia', 'San Marino', 'Serbia',
    'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'Tajikistan', 'Tanzania', 'Thailand', 'Turkey', 'Turkmenistan',
    'United Kingdom', 'United States of America'];
const enableAnimation = true;
const panningSensitivity = 58;
const margin = 20;
const maxZoom = 80;
const minZoom = 0.9;
const tooltip = d3.select("#tooltip");
let pointData = [];
let pointDataVisible = [];
const CountryHoveredColor = "lightcoral";
const state = {
    data: undefined,
    rotation: [0, -20, 0],
    scale: undefined,
    translation: undefined,
    initialScale: undefined,
};

function colorP(d){
    const sh = getSelectedHike();
    if (sh.includes(d)) { 
        if (sh[0] === d) { return CP[4]; }
        if (sh[1] === d) { return CP[5]; }
        if (sh[2] === d) { return CP[6]; }
     }
    else {return 'green' }
}
function colorPHighlight(d){
    const sh = getSelectedHike();
    if (sh.includes(d)) { 
        if (sh[0] === d) { return CP[4]; }
        if (sh[1] === d) { return CP[5]; }
        if (sh[2] === d) { return CP[6]; }
     }
    else {return 'lightcoral' }
}
// Select the SVG element by its ID
const mapDiv = d3.select('.Map'); 
const width = mapDiv.node().clientWidth;
const height = mapDiv.node().clientHeight;
const projection = d3.geoOrthographic();
const path = d3.geoPath(projection);
const graticule = d3.geoGraticule();
const allCountriesNames = [];


// Select the SVG element by its class and set its dimensions
const svg = d3.select('.Map__SVG')
    .attr('width', width)
    .attr('height', height);


function createMap(firstTenHikes) {
    pointData = firstTenHikes;
    projection
        .rotate(state.rotation)
        .scale(state.scale)
        .translate(state.translation);

    svg.selectAll('path.outline')
        .data([{ type: 'Sphere' }])
        .join('path')
        .attr('class', 'outline')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

    svg.selectAll('path.graticule')
        .data([null])
        .join('path')
        .attr('class', 'graticule')
        .attr('d', path(graticule()))
        .attr('fill', 'none')
        .attr('stroke', 'lightgrey')
        .attr('stroke-width', 0.5);

    svg.selectAll('path.country')
        .data(state.data.features)
        .join('path')
        .attr('d', path)
        .attr('class', 'country')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5)
        .attr('fill', function(d) {
            const sc = getSelectedCountry();
            if (countriesWithHikes.includes(d.properties.name)) {
                if (sc.includes(d.properties.name)) {
                    if (sc[0]=== d.properties.name){return CP[1];}
                    if (sc[1]=== d.properties.name){return CP[2];}
                    if (sc[2]=== d.properties.name){return CP[3];}
                    return 'blue'; // Selected country color
                }
                return CP[0]; // Country with hikes
            } else {
                return 'grey'; // Country without hikes
            }
        })
        .on('mouseover', function(event, d) {
            if (countriesWithHikes.includes(d.properties.name)) {
                ;
                let sc = getSelectedCountry();
                const isSelected = sc.includes(d.properties.name);
                // Change the appearance for hover
                d3.select(this)
                    .attr('fill', d=> {if(isSelected){
                        if (sc[0]=== d.properties.name){
                            tooltip.style("border", "4px solid " + CP[1])
                            .style("box-shadow", "inset 0 0 5px " + CP[1]+ ", 0 0 5px grey");
                            return CP[1];}
                        if (sc[1]=== d.properties.name){
                            tooltip.style("border", "4px solid " + CP[2])
                            .style("box-shadow", "inset 0 0 5px " + CP[2]+ ", 0 0 5px grey");
                            return CP[2];}
                        if (sc[2]=== d.properties.name){
                            tooltip.style("border", "4px solid " + CP[3])
                            .style("box-shadow", "inset 0 0 5px " + CP[3]+ ", 0 0 5px grey");;
                            return CP[3];}
                    } 
                    else{
                        tooltip.style("border", "4px solid " + CountryHoveredColor)
                        .style("box-shadow", "inset 0 0 5px " + CountryHoveredColor+ ", 0 0 5px grey");;
                        return CountryHoveredColor}});
            

            tooltip//.transition().duration(200)
                    .style("opacity", 0.95)
                    .text(d.properties.name)
            tooltip.style("top", (event.pageY + 10) + "px")  // Position below the cursor
                    .style("left", (event.pageX + 10) + "px"); 
            }
        })
        .on('mouseout', function(event, d) {
            if (countriesWithHikes.includes(d.properties.name)) {
                let sc = getSelectedCountry();
                const isSelected = sc.includes(d.properties.name);
                // Change the appearance for hover
                d3.select(this)
                    .attr('fill', d=> {if(isSelected){
                        if (sc[0]=== d.properties.name){return CP[1];}
                        if (sc[1]=== d.properties.name){return CP[2];}
                        if (sc[2]=== d.properties.name){return CP[3];}
                    } 
                    else{return'#386641'}}); // Ensure to reset to #386641
            }
            tooltip//.transition().duration(200)
                    //.style("visibility", "hidden")
                    .style("opacity", 0);
        })
        .on('click', function(event, d) {
            if (countriesWithHikes.includes(d.properties.name)) {
                // Set the selected country
                setSelectedCountry(d.properties.name);
                createMap(firstTenHikes);
                // Update the global selected country
            }
        });

        createMapLegend();

        }

function createMapPoints(pointdata) {
    if(pointdata){pointDataVisible = pointdata;}
    svg.selectAll("circle.pinPoint")
    .data(pointData)
        .enter()
        .append("circle")
        .attr("class", "pinPoint")
        .attr("r", 2.5)
        .attr("r",6)  // Set the initial radius
        .attr("fill", "green")  // Add fill color
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr('transform', d => {
                return `translate(${projection([d.max_pos_lon, d.max_pos_lat])})`;
             })
        .on("mouseover", (event, d) => {
                // Show the tooltip and set its content to the hike name
                console.log("la couleur du point c'est",colorP(d));
                tooltip.style("border", "4px solid " + colorPHighlight(d))
                .style("box-shadow", "inset 0 0 5px " + colorPHighlight(d)+ ", 0 0 5px grey")
                tooltip
                    .style("opacity", 0.95)
                    .html(`
                        <strong>Hike:</strong> ${d.name}<br>
                        <strong>Country:</strong> ${d.country_name}<br>
                        <strong>Length:</strong> ${d.length_3d}km<br>
                        `)
                tooltip.style("top", (event.pageY + 10) + "px")  // Position below the cursor
                    .style("left", (event.pageX + 10) + "px")
                      // Assuming your data has a `name` property for each hike
                
                d3.select(event.currentTarget)
                    .attr("fill", colorPHighlight(d))  // Highlight hover color
                    .attr("r", 6)
                    .raise();  // Bring to front
            })
        .on("mouseout", (event,d) => {
                // Hide the tooltip when the mouse leaves the point
                tooltip
                //.style("visibility", "hidden")
                .style("opacity", 0);
    
                d3.select(event.currentTarget)
                    .attr("fill", colorP(d))  // Keep green if selected, otherwise black
                    .attr("r", getSelectedHike().includes(d) ? 6 : 3.5);
            })
        .on("click", (event, d) => {
                // Set the selected hike when clicked
                setSelectedHike(d);  // Update the global selected hike
            })
        .filter(d => pointDataVisible.includes(d))
        .attr("stroke", "white")  // Filter for selected hikes
        .attr("r", 3.5)
        .raise()
        
    updateMapPoints();
        
}

function updateMapPoints() {
    const center = projection.invert([width / 2, height / 2]); // Recalculate the center of the map

    svg.selectAll("circle.pinPoint")
        .each(function(d) {
            const longitude= d.max_pos_lon;
            const latitude = d.max_pos_lat;
            const angle = d3.geoDistance([longitude, latitude], center);
            const point = d3.select(this);
            
            // Only update visible points and move their positions
            if (angle < Math.PI / 2) {
                point
                    .attr("display", null)  // Ensure the point is visible
                    .attr("transform", `translate(${projection([longitude, latitude])})`);
            } else {
                point.attr("display", "none");  // Hide points on the other side of the globe
            }
        })
        .attr("fill", d => colorP(d))  // Highlight selected hike in green
        .attr("r", d =>getSelectedHike().includes(d) ? 6 : 3)
        .attr("r",d=>pointDataVisible.includes(d) ? 3.5 : 2.5)
    
    svg.selectAll("circle.pinPoint")
        .filter(d => getSelectedHike().includes(d))  // Filter for selected hikes
        .raise();

}
function updateMapCoutries() {
    svg.selectAll('path.country')
        .attr('fill', function(d) {
            const sc = getSelectedCountry();
            if (countriesWithHikes.includes(d.properties.name)) {
                if (sc.includes(d.properties.name)) {
                    if (sc[0]=== d.properties.name){
                        tooltip.style("border", "4px solid " + CP[1])
                        .style("box-shadow", "inset 0 0 5px " + CP[1]+ ", 0 0 5px grey");
                        return CP[1];}
                    if (sc[1]=== d.properties.name){
                        tooltip.style("border", "4px solid " + CP[2])
                        .style("box-shadow", "inset 0 0 5px " + CP[2]+ ", 0 0 5px grey");
                        return CP[2];}
                    if (sc[2]=== d.properties.name){
                        tooltip.style("border", "4px solid " + CP[3])
                        .style("box-shadow", "inset 0 0 5px " + CP[3]+ ", 0 0 5px grey");
                        return CP[3];}
                    return 'blue'; // Selected country color
                }
                return CP[0]; // Country with hikes
            } else {
                return 'grey'; // Country without hikes
            }
        })
        .on('mouseover', function(event, d) {
            if (countriesWithHikes.includes(d.properties.name)) {
                ;
                let sc = getSelectedCountry();
                const isSelected = sc.includes(d.properties.name);
                // Change the appearance for hover
                d3.select(this)
                    .attr('fill', d=> {if(isSelected){
                        if (sc[0]=== d.properties.name){return CP[1];}
                        if (sc[1]=== d.properties.name){return CP[2];}
                        if (sc[2]=== d.properties.name){return CP[3];}
                    } 
                    else{return CountryHoveredColor}});
            tooltip .style("opacity", 0.95)
                    .text(d.properties.name);
            tooltip.style("top", (event.pageY + 10) + "px")  // Position below the cursor
                    .style("left", (event.pageX + 10) + "px"); 
            }
        })
        .on('mouseout', function(event, d) {
            if (countriesWithHikes.includes(d.properties.name)) {
                let sc = getSelectedCountry();
                const isSelected = sc.includes(d.properties.name);
                // Change the appearance for hover
                d3.select(this)
                    .attr('fill', d=> {if(isSelected){
                        if (sc[0]=== d.properties.name){return CP[1];}
                        if (sc[1]=== d.properties.name){return CP[2];}
                        if (sc[2]=== d.properties.name){return CP[3];}
                    } 
                    else{return'#386641'}}); // Ensure to reset to #386641
                tooltip
                .style("opacity", 0);
            
            }
        })
        .on('click', function(event, d) {
            if (countriesWithHikes.includes(d.properties.name)) {
                // Set the selected country
                setSelectedCountry(d.properties.name);
                createMap(firstTenHikes);
                // Update the global selected country
            }
        });



}

function fetchData(data) {
    fetch(worldAtlasURL)
        .then(response => response.json())
        .then(topoJSONData => {
            state.data = topojson.feature(topoJSONData, 'countries');
            const fittedProjection = d3.geoOrthographic().fitExtent(
                [
                    [margin, margin],
                    [width - margin, height - margin],
                ],
                { type: 'Sphere' },
            );
            state.initialScale = fittedProjection.scale();
            state.scale = state.initialScale;
            state.translation = fittedProjection.translate();

            createMap(data);
            createMapPoints();
        });
}

function setupDragBehavior(data) {
    svg.call(d3.drag()
    .on('drag', (event) => {
        const k = panningSensitivity / state.scale;
        state.rotation = [
            state.rotation[0] + event.dx * k,               // Update the longitude (rotation[0])
            Math.max(-70, Math.min(55, state.rotation[1] - event.dy * k)),  // Clamp latitude (rotation[1])
            state.rotation[2],                              // Keep rotation[2] unchanged
        ];
        
        // Update the map and points
        createMap(data);
        updateMapPoints();
        createMapLegend();
        
    }));
}

function setupZoomBehavior(data) {
    svg.call(d3.zoom()
        .on('zoom', ({ transform }) => {
            const zoomFactor = Math.max(minZoom, Math.min(maxZoom, transform.k));
            // Update the scale using the clamped zoom factor
            state.scale = state.initialScale * zoomFactor;
            createMap(data);
            updateMapPoints();
            createMapLegend();
        }));
}

function initMap(data) {
    fetchData(data);
    setupDragBehavior(data);
    setupZoomBehavior(data);
}

export { initMap, createMap, createMapPoints, updateMapPoints, updateMapCoutries };


function createMapLegend() {
    const legend = d3.select('.Map__SVG')
      .append('g')
      .attr('class', 'map-legend')
      .attr('transform', `translate(20, ${height - 40})`); // Position in bottom-left
  
    // Add grey square for "No Data"
    legend.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', 'grey');
  
    // Add "No Data" text
    legend.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .style('fill', 'black')
      .text('No Data');
  }
