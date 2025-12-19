const width = 1000;
const height = 600;
const tooltip = d3.select("#tooltip");

// 1. Création du SVG et de la Projection
const svg = d3.select("#map-container")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

// Projection "Natural Earth" (donne un bel aspect arrondi à la terre)
const projection = d3.geoNaturalEarth1()
    .scale(200)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// 2. Échelle de couleurs (du jaune au bleu foncé)
const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([0, 100]); // Les indices vont de 0 à 100

// 3. Chargement des données (Géo + CSV)
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("Cyber_security.csv")
]).then(([geoData, csvData]) => {
    
    // Organiser les données CSV par nom de pays pour un accès rapide
    const dataMap = new Map();
    csvData.forEach(d => {
        dataMap.set(d.Country, {
            GCI: +d.GCI,
            NCSI: +d.NCSI,
            DDL: +d.DDL
        });
    });

    // Dessiner la carte initiale
    function updateMap(selectedIndice) {
        svg.selectAll(".country")
            .data(geoData.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", d => {
                const countryName = d.properties.name;
                const score = dataMap.get(countryName);
                // Si le pays est dans le CSV, on colorie, sinon gris
                return score ? colorScale(score[selectedIndice]) : "#e0e0e0";
            })
            // Interactivité
            .on("mouseover", function(event, d) {
                const countryName = d.properties.name;
                const score = dataMap.get(countryName);
                const val = score ? score[selectedIndice] : "Pas de données";
                
                tooltip.style("visibility", "visible")
                       .html(`<strong>${countryName}</strong><br>${selectedIndice}: ${val}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY - 10) + "px")
                       .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseleave", () => tooltip.style("visibility", "hidden"));
    }

    // Écouter le changement de l'indice
    d3.select("#index-selector").on("change", function() {
        updateMap(this.value);
    });

    // Premier affichage (GCI par défaut)
    updateMap("GCI");

}).catch(err => console.error("Erreur de chargement :", err));