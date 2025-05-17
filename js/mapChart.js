const width = 960;
const height = 550;

const svg = d3
  .select("#map-chart-svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet") //preserve the aspect ratio of the SVG to be middle aligned and meet the container size
  .attr("width", "100%")
  .attr("height", "100%"); // In order for the height to be responsive, its parent element must have a defined height



// Legend settings
const legendWidth = 200;
const legendHeight = 20;
const legendBackgroundXOffset = -10;
const legendBackgroundYOffset = -30;
const legendBackgroundWidth = legendWidth + 20;
const legendBackgroundHeight = legendHeight + 50;
const legendBackgroundCorner = 5;
const legendTitleYOffset = -10;

// Projection and Path Generator
const projection = d3.geoMercator()
  .center([-123.1, 49.25])
  .scale(90000)
  .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath().projection(projection);

// Group container
const g = svg.append("g");

// Enable zoom
g.call(
  d3.zoom().on("zoom", (event) => {
    g.attr("transform", event.transform);
  })
);

// Exported function to render the map with filtered data
export function renderMapChart(data) {
  let clickValue = "";
  let dataFilter = data;
  if (document.getElementById("click-value").value !== "") {
    clickValue = document.getElementById("click-value").value;
    dataFilter = data.filter(d => d.geoLocalArea === clickValue);
  }


  // Clear previous map
  g.selectAll("*").remove();
  svg.selectAll(".legend-group").remove(); // Clear old legend too
  // Tooltip (reuse main tooltip)
  const tooltip = d3.select("#tooltip");

  // Load Vancouver GeoJSON
  d3.json("data/vancouver.geojson").then(geoData => {

    // Group permit data by neighborhood
    const permitCounts = d3.rollup(
      dataFilter,
      v => v.length,
      d => d.geoLocalArea
    );

    const maxCount = d3.max(Array.from(permitCounts.values()));
    const minCount = d3.min(Array.from(permitCounts.values()));

    // Color scale based on counts
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([minCount, maxCount]);

    // Draw neighborhoods
    g.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("class", "neighborhood")
      .attr("d", pathGenerator)
      .attr("fill", d => {
        const name = d.properties.name;
        const count = permitCounts.get(name);
        return count ? colorScale(count) : "#f9f9f9";
      })
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        const name = d.properties.name;
        const count = permitCounts.get(name) || 0;

        tooltip.transition()
          .duration(200)
          .style("opacity", 1);

        tooltip.html(`<strong>Neighborhood:</strong> ${name}<br><strong>Permits:</strong> ${count}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(event.currentTarget)
          .attr("stroke", "black")
          .attr("stroke-width", 2);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", (event) => {
        tooltip.transition()
          .duration(300)
          .style("opacity", 0);

        d3.select(event.currentTarget)
          .attr("stroke", "#999")
          .attr("stroke-width", 1);
      });

    // --- Correct Legend Setup ---
    const legendGroup = svg.append("g")
      .attr("class", "legend-group")
      .attr("transform", `translate(${width - legendWidth - 30}, ${height - 80})`);

    // Background behind legend
    legendGroup.append("rect")
      .attr("x", legendBackgroundXOffset)
      .attr("y", legendBackgroundYOffset)
      .attr("width", legendBackgroundWidth)
      .attr("height", legendBackgroundHeight)
      .attr("fill", "white")
      .attr("opacity", 0.7)
      .attr("rx", legendBackgroundCorner)
      .attr("ry", legendBackgroundCorner);

    // Gradient definition
    const defs = svg.append("defs");

    const linearGradient = defs.append("linearGradient")
      .attr("id", "permit-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(minCount));

    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(maxCount));

    // Color bar
    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#permit-gradient)");

    // Axis scale
    const legendScale = d3.scaleLinear()
      .domain([minCount, maxCount])
      .range([0, legendWidth]);

    // Create and draw an axis for the legend
    const legendAxis = d3.axisBottom(legendScale)
      .tickSize(legendHeight + 5)
      .ticks(5);

    legendGroup.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .select(".domain").remove();

    // Legend title
    legendGroup.append("text")
      .attr("class", "legend-title")
      .attr("x", legendWidth / 2)
      .attr("y", legendTitleYOffset)
      .attr("text-anchor", "middle")
      .text("Number of Permits");

  });
}

