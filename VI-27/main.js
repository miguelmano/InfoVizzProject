
import {createScatterPlot,updateScatterPlotHighlight} from './scatterPlot.js';
import {populateCountryDropdown,createAllSlider,lengthLowerValue,lengthUpperValue,altLowerValue,altUpperValue,diffLowerValue,diffUpperValue,UpdateAltitudeSlider,UpdateLengthSlider,UpdateDifficultySlider} from './filters.js';
import {createRadarChart, updateRadarPlot,createLegend} from './radarChart.js';
import {createMap, initMap,updateMapPoints,updateMapCoutries, createMapPoints} from './map.js';

let data;
let initialData
let globalData;
let aData
let countrySelect = document.getElementById("country-filter");
let selectedCountry = "all";
let filteredCountryData;
let firstTenHikes;
let selectedCountries = [];
let selectedHikes = [];


const CP = [
  "#386641", // Dark Green
  "#D81159", // Orange Red
  "#ffbc42", // Bright Yellow
  "#1E90FF", // Vibrant Blue (Dodger Blue)
  "#8A2BE2", // Blue Violet
  "#73d2de", // Light Blue
  "#FF4500"   // Vibrant Orange Red
];



//selectedHike
function getSelectedHike() {
  return selectedHikes;
}

function removeHikeByName(name) {
  const hike = selectedHikes.find(h => h.name === name);
  if (hike) {
    setSelectedHike(hike);
  }
}

function setSelectedHike(hike) {
  //remove the hike if clicked again
  if(selectedHikes.includes(hike)){
    selectedHikes=selectedHikes.filter(h => h!== hike);
    
  }else{
    if (selectedHikes.length >=3) {
      selectedHikes.pop();
      selectedHikes.push(hike);
    }
    else{selectedHikes.push(hike);}
    
  }
  d3.select(".Radar__SVG").selectAll("*").remove();
  
  updateRadarPlot(null, selectedHikes);
  updateMapPoints();
  updateScatterPlotHighlight();
  createLegend();
  filterByCountries(selectedCountries);
  
}
//selectedCountry
function getSelectedCountry() {
  return selectedCountries;}

function setSelectedCountry(country) {
  if (country === "all") {
    selectedCountries = ["all"];
    filterByCountries(selectedCountries);
    updateFilter();
    updateMapCoutries();
    createLegend();
    updateRadarPlot();
    console.log("on supprime tou et met all",selectedCountries);
    return;
  }
  if (selectedCountries.includes("all")) {
    console.log("on supprime all car on select un country qui est pas all",selectedCountries);
    selectedCountries = [];}

  //quand il est deja dans la liste
  if(selectedCountries.includes(country)){
    selectedCountries = selectedCountries.filter(c => c !== country); 
    console.log("on a supprimé",selectedCountries);
    if (selectedCountries.length === 0) {
      selectedCountries = ["all"];
      console.log("y a plus rien donc on met all",selectedCountries);
    }
    filterByCountries(selectedCountries)
    updateFilter();
    updateMapCoutries();
    createLegend();
    updateRadarPlot();
    console.log(selectedCountries);
  }
  //quand il n'est pas dans la liste
  else if(!selectedCountries.includes(country)){
    if (selectedCountries.length >=3) {
      selectedCountries.pop();
      selectedCountries.push(country);
      console.log("on a ajouté",selectedCountries,"et suprrimer le dernie");
    }
    else{ console.log("on a juste ajouté",selectedCountries);
      selectedCountries.push(country);}
    filterByCountries(selectedCountries);
    updateFilter();
    updateMapCoutries();
    createLegend();
    updateRadarPlot();
    console.log(selectedCountries);
  }

}

function setFilterListener(){
  console.log("on set les listeners");
  countrySelect.addEventListener('click', () => {
  const selectedCountry = countrySelect.value;
  // Use setSelectedCountry to handle the logic
  setSelectedCountry(selectedCountry); })
  
  document.addEventListener('lenChange', () => {
    data = filteredCountryData.filter(hike => hike.length_3d >= lengthLowerValue && hike.length_3d <= lengthUpperValue
      && hike.min_elevation >= altLowerValue && hike.max_elevation <= altUpperValue 
      && hike.difficulty >= diffLowerValue && hike.difficulty <= diffUpperValue
    );
    console.log("data",data);
    d3.select(".Scatter__SVG").selectAll("*").remove();
    createScatterPlot(data);
    updateScatterPlotHighlight();
    d3.select(".Map__SVG").selectAll("circle").remove();
    createMapPoints(data);
  });
  document.addEventListener('altChange', () => {
    data = filteredCountryData.filter(hike => hike.min_elevation >= altLowerValue && hike.max_elevation <= altUpperValue 
      && hike.length_3d >= lengthLowerValue && hike.length_3d <= lengthUpperValue 
      && hike.difficulty >= diffLowerValue && hike.difficulty <= diffUpperValue);
    d3.select(".Scatter__SVG").selectAll("*").remove();
    createScatterPlot(data);
    updateScatterPlotHighlight();
    d3.select(".Map__SVG").selectAll("circle").remove();
    createMapPoints(data);
  });
  document.addEventListener('diffChange', () => {
    console.log("Difficulty Value changed to:", diffLowerValue,diffUpperValue);
    console.log("data avant modif",filteredCountryData)
    data = filteredCountryData.filter(hike => hike.difficulty >= diffLowerValue && hike.difficulty <= diffUpperValue
      && hike.length_3d >= lengthLowerValue && hike.length_3d <= lengthUpperValue
      && hike.min_elevation >= altLowerValue && hike.max_elevation <= altUpperValue);
    console.log("data",data);
    d3.select(".Scatter__SVG").selectAll("*").remove();
    createScatterPlot(data);
    updateScatterPlotHighlight();
    d3.select(".Map__SVG").selectAll("circle").remove();
    createMapPoints(data);

  });
 

}

function updateFilter(){
  const countrySelect = document.getElementById("country-filter");

    // Update the background color of the options based on selection
    Array.from(countrySelect.options).forEach(option => {
       
      const sc =getSelectedCountry();
      if (sc.includes(option.value)) {
          if (sc[0]=== "all"){option.style.backgroundColor = CP[0];}
          else if (sc[0]=== option.value){option.style.backgroundColor = CP[1];}
          else if (sc[1]=== option.value){option.style.backgroundColor = CP[2];}
          else if (sc[2]=== option.value){option.style.backgroundColor = CP[3];}
          // Set color to green if the country is selected
      } else {
          // Reset other options to white
          option.style.backgroundColor = 'white';
      }
    });

}

function init(){
  d3.csv('Hikes_A_26october.csv').then(function(averageData) {
  d3.csv('Hikes_26october.csv').then(function(CSVdata) {
    CSVdata.forEach(d => {
      d.max_pos_lon = +d.max_pos_lon; // Convert to number
      d.max_pos_lat = +d.max_pos_lat; // Convert to number
      d.max_elevation = +d.max_elevation;
      d.min_elevation = +d.min_elevation;
      d.length_3d = Math.round(d.length_3d/100)/10 // Convert to number
    });
    averageData.forEach(d => {
      d.length_3d = Math.round(d.length_3d/100)/10
    });
    initialData = CSVdata;
    firstTenHikes = CSVdata;
    globalData = CSVdata;
    filteredCountryData = CSVdata;
    data = CSVdata;
    aData = averageData;
    populateCountryDropdown(data);
    createScatterPlot(data);
    createRadarChart([averageData[0]],[],averageData);
    createLegend(); 
    initMap(data);
    createAllSlider(data);
    setFilterListener();    
    window.addEventListener('resize', resize);
    setSelectedCountry("all");
    console
    resize();
  });
  });}

function filterByCountries(selectedCountries) {

  if (selectedCountries.length === 0 || selectedCountries.includes("all")) {
      // If "All" is selected, use the original data
      filteredCountryData = globalData;  // Assuming globalData contains all your hike data
  } else {
      // Filter the data based on the selected country
      filteredCountryData = globalData.filter(hike => selectedCountries.includes(hike.country_name) || selectedHikes.includes(hike));
  }
  UpdateLengthSlider(d3.min(filteredCountryData, d => d["length_3d"]), d3.max(filteredCountryData, d => d["length_3d"]));
  UpdateAltitudeSlider(d3.min(filteredCountryData, d => d["min_elevation"]), d3.max(filteredCountryData, d => d["max_elevation"]));
  UpdateDifficultySlider(d3.min(filteredCountryData, d => d["diff"]), d3.max(filteredCountryData, d => d["diff"]));
  // Call the function to update the scatter plot with the filtered data
  d3.select(".Scatter__SVG").selectAll("*").remove();
  createScatterPlot(filteredCountryData);
  d3.select(".Map__SVG").selectAll("circle").remove();
  createMapPoints(filteredCountryData);
  updateScatterPlotHighlight();
}

function resize() {
  
// Remove the existing SVG and h3 before redrawing
  d3.select(".Scatter__SVG").selectAll("*").remove();
  createScatterPlot(data);
  updateScatterPlotHighlight();
}
init();

export {setSelectedHike,getSelectedHike,removeHikeByName};
export {setSelectedCountry,getSelectedCountry};
export {CP};
