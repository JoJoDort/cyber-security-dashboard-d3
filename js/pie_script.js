const indices = ["GCI", "NCSI", "DDL"];
const tooltip = d3.select("#tooltip");
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

d3.csv("Cyber_security.csv").then(data => {
    data.forEach(d => indices.forEach(key => d[key] = +d[key]));

    const container = d3.select("#toggle-container");

    // 1. GÉNÉRER LES TOGGLES
    data.forEach(d => {
        const label = container.append("label").attr("class", "toggle-item");
        
        label.append("input")
            .attr("type", "checkbox")
            .attr("value", d.Country)
            .on("change", updateVisualization); // Mise à jour au clic

        label.append("span").text(d.Country);
    });

    // 2. GESTION DE LA RECHERCHE
    d3.select("#country-search").on("input", function() {
        const searchTerm = this.value.toLowerCase();
        d3.selectAll(".toggle-item").each(function() {
            const countryName = d3.select(this).text().toLowerCase();
            d3.select(this).classed("hidden", !countryName.includes(searchTerm));
        });
    });

    // 3. FONCTION DE MISE À JOUR
    function updateVisualization() {
        // Récupérer tous les pays cochés
        const selectedCountries = [];
        d3.selectAll(".toggle-item input:checked").each(function() {
            selectedCountries.push(this.value);
        });

        const filteredData = data.filter(d => selectedCountries.includes(d.Country));
        
        // Redessiner les 3 camemberts
        indices.forEach(indice => {
            renderPie(indice, filteredData);
        });
    }
});

// La fonction renderPie reste la même que précédemment (avec le calcul du total et %)
function renderPie(indice, data) {
    const container = d3.select(`#chart-${indice}`);
    container.html(""); 

    if (data.length === 0) {
        container.append("p").text("Sélectionnez des pays pour comparer").style("color", "#999");
        return;
    }

    const totalSelected = d3.sum(data, d => d[indice]);
    const width = 280, height = 280, margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = container.append("svg")
        .attr("width", width).attr("height", height)
      .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    const pie = d3.pie().value(d => d[indice]).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.4).outerRadius(radius);

    svg.selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.Country))
        .attr("stroke", "white")
        .on("mouseover", function(event, d) {
            const percentage = ((d.data[indice] / totalSelected) * 100).toFixed(1);
            tooltip.style("visibility", "visible")
                   .html(`<strong>${d.data.Country}</strong><br>Part : ${percentage}%`);
        })
        .on("mousemove", (e) => tooltip.style("top", (e.pageY-10)+"px").style("left", (e.pageX+10)+"px"))
        .on("mouseleave", () => tooltip.style("visibility", "hidden"));
}