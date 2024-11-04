
function populateCountryDropdown(data) {
    const countrySelect = document.getElementById("country-filter");

    // Get unique countries from the data
    const uniqueCountries = [...new Set(data.map(hike => hike.country_name))].sort();

    // Populate the dropdown with country options
    uniqueCountries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

let [diffLowerValue, diffUpperValue] = [0, 6];
let [altLowerValue, altUpperValue] = [0, 5000];
let [lengthLowerValue, lengthUpperValue] = [0, 800];
const lc = new Event('lenChange');
const ac = new Event('altChange');
const dc = new Event('diffChange');
let data = null;


function createAllSlider(df){
    createSlider('#s_length__SVG',"Length (km)",df,"length_3d","length_3d",null,null);
    createSlider('#s_alt__SVG',"Altitude (m)",df,"min_elevation","max_elevation",null,null);
    // Example call to create the difficulty slider
    const difficultyLevels = ["T1", "T2", "T3", "T4", "T5", "T6"];
    createCategoricalSlider("#s_diff__SVG", "Difficulty", difficultyLevels, null,null);
}
function UpdateLengthSlider(upper,lower){
    d3.select("#s_length__SVG").selectAll("*").remove();
    console.log("on le recree deja ")
    createSlider('#s_length__SVG',"Length (km)",data,"length_3d","length_3d",upper,lower);
}
function UpdateAltitudeSlider(upper,lower){
    d3.select("#s_alt__SVG").selectAll("*").remove();
    createSlider('#s_alt__SVG',"Altitude (m)",data,"min_elevation","max_elevation",upper,lower);
}

function UpdateDifficultySlider(upper,lower){
    d3.select("#s_diff__SVG").selectAll("*").remove();
    const difficultyLevels = ["T1", "T2", "T3", "T4", "T5", "T6"];
    createCategoricalSlider("#s_diff__SVG", "Difficulty", difficultyLevels, upper,lower);
}

function createSlider(svgID,labelText,df,datalabel_min,datalabel_max,lowerBound,upperBound){ {

    data = df;

    // Configuration du slider$
    const svg = d3.select(svgID);
    const svgRect = svg.node().getBoundingClientRect();

    // Configuration du slider
    const sliderHeight = svgRect.height;
    const sliderWidth = svgRect.width;

    const margin = {left: 20, right: 20, top: 20, bottom: 20};
    const minRange = d3.min(data, d => d[datalabel_min]);
    const maxRange = d3.max(data, d => d[datalabel_max]);

    // Créer une échelle linéaire pour mapper les valeurs numériques aux positions sur le slider
    const xScale = d3.scaleLinear()
        .domain([minRange, maxRange])
        .range([margin.left, sliderWidth - margin.right])
        .clamp(true);

    // Sélectionner l'élément SVG du slider

    svg.append("text")
        .attr("class", "slider-label")
        .attr("x", sliderWidth / 2) // Center the text
        .attr("y", 20) // Adjust this value to position the text above the slider
        .attr("text-anchor", "middle")
        .attr("fill", "grey") // Set text color to grey
        .attr("font-weight", "bold") // Make the text bold
        .text(labelText);

    // Ajouter une ligne de base pour représenter la plage totale du slider
    svg.append("line")
        .attr("id", "line")
        .attr("x1", margin.left)
        .attr("x2", sliderWidth - margin.right)
        .attr("y1", sliderHeight / 2)
        .attr("y2", sliderHeight / 2);

    // Position initiale des poignées
    

    let lowerValue ; // Valeur minimale initiale
    let upperValue ; // Valeur maximale initiale
    if (lowerBound == null) { lowerValue = minRange; }
    else { lowerValue = Math.max(minRange, lowerBound); }
    if (upperBound == null) { upperValue = maxRange; }
    else { upperValue = Math.min(maxRange, upperBound); }
    console.log("upperBound",upperBound,"lowerBound",lowerBound)
    //console.log("upperValue",upperValue)
    //console.log("lowerValue",lowerValue)

    // Ajouter la ligne représentant la plage sélectionnée
    const rangeLine = svg.append("line")
        .attr("id", "range-line")
        .attr("x1", xScale(lowerValue))
        .attr("x2", xScale(upperValue))
        .attr("y1", sliderHeight / 2)
        .attr("y2", sliderHeight / 2);

    // Fonction de mise à jour des positions des poignées
    function updateHandles(svgID,handle) {
        lowerHandle.attr("cx", xScale(lowerValue));
        //console.log("lowerValue",xScale(lowerValue))
        upperHandle.attr("cx", xScale(upperValue));
        rangeLine.attr("x1", xScale(lowerValue)).attr("x2", xScale(upperValue));

        lowerValueText.attr("x", xScale(lowerValue)).text(Math.round(lowerValue));
        upperValueText.attr("x", xScale(upperValue)).text(Math.round(upperValue));
        if (svgID == "#s_length__SVG"){
            lengthLowerValue = lowerValue;
            lengthUpperValue = upperValue;
            // Dispatch the events when the values change
            document.dispatchEvent(lc);

        }
        if (svgID == "#s_alt__SVG"){
            altUpperValue = upperValue;
            altLowerValue = lowerValue;
            document.dispatchEvent(ac);
        }
        if (svgID == "#s_diff__SVG"){
            diffUpperValue = upperValue;
            diffLowerValue = lowerValue;
            document.dispatchEvent(dc);
        }

        if(handle=="lower"){
            if (lowerValue+1 == upperValue) {
                lowerHandle // Select the hovered circle
                .attr("r", 14)
                .raise();
            }else{
                lowerHandle // Select the hovered circle
                .attr("r", 8);
            }
        }else{
            if (lowerValue == upperValue-1) {
                upperHandle // Select the hovered circle
                .attr("r", 14)
                .raise();
            }else{
                upperHandle // Select the hovered circle
                .attr("r", 8);
            }
        }
    }

    // Ajouter les poignées (handles)
    const lowerHandle = svg.append("circle")
        .attr("class", "lower-handle")
        .attr("cx", xScale(lowerValue))
        .attr("cy", sliderHeight / 2)
        .attr("r", 8)
        .call(d3.drag()
            .on("drag", function(event) {
                lowerValue = Math.min(upperValue - 1, xScale.invert(event.x)); // Empêcher la poignée inférieure de dépasser la supérieur
                updateHandles(svgID,"lower");
            })
        );

    const upperHandle = svg.append("circle")
        .attr("class", "upper-handle")
        .attr("cx", xScale(upperValue))
        .attr("cy", sliderHeight / 2)
        .attr("r", 8)
        .call(d3.drag()
            .on("drag", function(event) {
                upperValue = Math.max(lowerValue + 1, xScale.invert(event.x)); // Empêcher la poignée supérieure de dépasser l'inférieure
                updateHandles(svgID,"upper");
            })
        );
    
    const lowerValueText = svg.append("text")
        .attr("class", "lower-value-label")
        .attr("x", xScale(lowerValue))
        .attr("y", sliderHeight / 2 + 20) // Positionnez le texte sous la poignée
        .attr("text-anchor", "middle") // Centrer le texte
        .text(lowerValue);
    
    const upperValueText = svg.append("text")
        .attr("class", "upper-value-label")
        .attr("x", xScale(upperValue))
        .attr("y", sliderHeight / 2 -20) // Positionnez le texte sous la poignée
        .attr("text-anchor", "middle") // Centrer le texte
        .text(upperValue);

    // Mettre à jour les poignées à l'initialisation
    updateHandles();
}
}

function createCategoricalSlider(svgID, labelText, categories, lowerBound, upperBound) {
    const svg = d3.select(svgID);
    const svgRect = svg.node().getBoundingClientRect();

    // Configuration du slider
    const svgHeight = svgRect.height;
    const svgWidth = svgRect.width;
    const margin = {left: 20, right: 20, top: 20, bottom: 20};

    // Create a band scale for categorical values
    const xScale = d3.scalePoint()
        .domain(categories)
        .range([margin.left, svgWidth-margin.right])
         // Adjust padding as needed

    console.log("xScale Domain:", xScale.domain());
    console.log("xScale Range:", xScale.range());
    console.log("xScale Bandwidth:", xScale.bandwidth());
         
    console.log(margin.left,svgWidth-margin.right)
        
    svg.append("line")
        .attr("id", "line")
        .attr("x1", margin.left)
        .attr("x2", svgWidth - margin.right)
        .attr("y1", svgHeight / 2)
        .attr("y2", svgHeight / 2);
        
    // Add the label text above the slider
    svg.append("text")
        .attr("class", "slider-label")
        .attr("x", svgWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "grey")
        .attr("font-weight", "bold")
        .text(labelText);

    // Create the range line (as a single line for categorical)

    categories.forEach((category, index) => {
            const tickX = xScale(category); // Center the tick on the category
    
            svg.append("line")
                .attr("class", "tick")
                .attr("x1", tickX)
                .attr("x2", tickX)
                .attr("y1", svgHeight / 2 - 5) // Tick length above the main line
                .attr("y2", svgHeight / 2 + 5) // Tick length below the main line
                .style("stroke", "lightgrey") // Tick color
                .style("stroke-width", "4")
                .style("stroke-linecap", "round");

            svg.append("text")
                .attr("class", "value-label")
                .attr("x", tickX ) // Center the text
                .attr("y", svgHeight / 2 + 30) // Position below the line
                .attr("text-anchor", "middle")
                .text(categories[index])
        });

    let lowerValue = "T1"; // Valeur minimale initiale
    let upperValue = "T6"; // Valeur maximale initiale
    


    if (lowerBound != null) { lowerValue = lowerBound.substring(0, 2) }
    if (upperBound != null) { upperValue = upperBound.substring(0, 2); }

    // Ajouter la ligne représentant la plage sélectionnée
    const rangeLine = svg.append("line")
        .attr("id", "range-line")
        .attr("x1", xScale(categories[0]))
        .attr("x2", xScale(categories[5]))
        .attr("y1", svgHeight / 2)
        .attr("y2", svgHeight / 2);

        function updateHandles(handle) {
            lowerHandle.attr("cx", xScale(lowerValue));
            upperHandle.attr("cx", xScale(upperValue));
            rangeLine.attr("x1", xScale(lowerValue)).attr("x2", xScale(upperValue));
            diffUpperValue = {"T1":1,"T2":2,"T3":3,"T4":4.5,"T5":5.5,"T6":6.5}[upperValue];
            diffLowerValue = {"T1":1,"T2":2,"T3":3,"T4":3.5,"T5":4.5,"T6":5.5}[lowerValue];
            document.dispatchEvent(dc);
            console.log("diffUpperValue",diffUpperValue,"diffLowerValue",diffLowerValue)
            if(handle=="lower"){
                if (lowerValue == upperValue) {
                    lowerHandle // Select the hovered circle
                    .attr("r", 14)
                    .raise();
                }else{
                    lowerHandle // Select the hovered circle
                    .attr("r", 8);
                }
            }else{
                if (lowerValue == upperValue) {
                    upperHandle // Select the hovered circle
                    .attr("r", 14)
                    .raise();
                }else{
                    upperHandle // Select the hovered circle
                    .attr("r", 8);
                }
            }
        }
    
        // Add the lower handle
        const lowerHandle = svg.append("circle")
        .attr("class", "handle")
        .attr("cx", xScale(lowerValue))
        .attr("cy", svgHeight / 2)
        .attr("r", 8)
        .style("fill", "#386641")
        .call(d3.drag()
            .on("drag", function(event) {
                const newX = event.x; // Get the x position of the mouse event
                const closestIndex = categories.reduce((prevIndex, curr, currIndex) => {
                    const prevX = xScale(categories[prevIndex]);
                    const currX = xScale(curr);
                    return Math.abs(currX - newX) < Math.abs(prevX - newX) ? currIndex : prevIndex;
                }, 0);

                // Update the lower value based on the closest category
                if (closestIndex <= categories.indexOf(upperValue)) {
                    lowerValue = categories[closestIndex];
                    updateHandles("lower");
                }
            })
        )

    // Add the upper handle
    const upperHandle = svg.append("circle")
        .attr("class", "handle")
        .attr("cx", xScale(upperValue))
        .attr("cy", svgHeight / 2)
        .attr("r", 8)
        .style("fill", "#386641")
        .call(d3.drag()
            .on("drag", function(event) {
                const newX = event.x; // Get the x position of the mouse event
                const closestIndex = categories.reduce((prevIndex, curr, currIndex) => {
                    const prevX = xScale(categories[prevIndex]);
                    const currX = xScale(curr);
                    return Math.abs(currX - newX) < Math.abs(prevX - newX) ? currIndex : prevIndex;
                }, 0);

                // Update the upper value based on the closest category
                if (closestIndex >= categories.indexOf(lowerValue)) {
                    upperValue = categories[closestIndex];
                    updateHandles("upper");
                }
            })
        )

    // Initial update to position the handles and line correctly
    updateHandles();
}


export { populateCountryDropdown, createAllSlider, lengthUpperValue, lengthLowerValue, altUpperValue, altLowerValue, diffUpperValue, diffLowerValue, UpdateLengthSlider,UpdateAltitudeSlider, UpdateDifficultySlider };