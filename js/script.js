// 1. Configuration des dimensions et constantes
const margin = { top: 40, right: 30, bottom: 20, left: 160 };
const width = 900 - margin.left - margin.right;
const rowHeight = 60; // Espace alloué à chaque pays
const keys = ["GCI", "NCSI", "DDL"];
const colors = ["#3498db", "#e67e22", "#2ecc71"];

// 2. Initialisation des outils (Échelles et Tooltip)
const color = d3.scaleOrdinal().domain(keys).range(colors);
const tooltip = d3.select("#tooltip");

// 3. Création de la légende automatique
const legendDiv = d3.select("#legend");
keys.forEach(key => {
    const item = legendDiv.append("div").attr("class", "legend-item");
    item.append("div")
        .style("width", "16px")
        .style("height", "16px")
        .style("background-color", color(key))
        .style("border-radius", "2px");
    item.append("span").text(key);
});

// 4. Chargement des données CSV
d3.csv("Cyber_security.csv").then(function(data) {
    
    // Nettoyage des données : conversion texte -> nombre
    data.forEach(d => {
        keys.forEach(key => d[key] = +d[key]);
    });

    const height = data.length * rowHeight;

    // Création du canevas SVG
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- ÉCHELLES ---
    const y0 = d3.scaleBand()
        .domain(data.map(d => d.Country))
        .range([0, height])
        .paddingInner(0.2);

    const y1 = d3.scaleBand()
        .domain(keys)
        .range([0, y0.bandwidth()])
        .padding(0.05);

    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    // --- AXES ---
    svg.append("g").call(d3.axisLeft(y0));
    
    // Axe X en haut avec lignes de grille
    svg.append("g")
        .call(d3.axisTop(x).ticks(10).tickSize(-height))
        .selectAll("line")
        .attr("stroke", "#f1f3f5");

    // --- DESSIN DES BARRES ---
    const countryGroups = svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(0, ${y0(d.Country)})`);

    countryGroups.selectAll("rect")
        .data(d => keys.map(key => ({ country: d.Country, key: key, value: d[key] })))
        .join("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", d => y1(d.key))
        .attr("width", d => x(d.value))
        .attr("height", y1.bandwidth())
        .attr("fill", d => color(d.key))
        // --- ÉVÉNEMENTS SOURIS ---
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 0.7).attr("stroke", "#000");
            tooltip.style("visibility", "visible")
                   .html(`<strong>${d.country}</strong><br>${d.key}: ${d.value}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 15) + "px")
                   .style("left", (event.pageX + 15) + "px");
        })
        .on("mouseleave", function() {
            d3.select(this).style("opacity", 1).attr("stroke", "none");
            tooltip.style("visibility", "hidden");
        });

}).catch(err => console.error("Erreur de chargement :", err));