const svg = d3.select("#pie-chart-svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

svg
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("width", "100%")
  .attr("height", "100%");

// Set radius for the pie chart
const radius = Math.min(width, height) / 2 - 50;

// Create a group element and center it
const g = svg.append("g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

// Define a bold/darker color scheme
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Create tooltip div (reuse main tooltip)
const tooltip = d3.select("#tooltip");

// Exported function to render the pie chart based on filtered data
export function renderPieChart(data) {
  // Clear previous pie chart
  g.selectAll("*").remove();
  svg.selectAll(".pie-title").remove();

  let clickValue = "";
  let dataFilter = data;
  if (document.getElementById("click-value").value !== "") {
    clickValue = document.getElementById("click-value").value;
    dataFilter = data.filter(d => d.geoLocalArea === clickValue);
  }


  // Group data by work type and count
  const workTypeCounts = Array.from(
    d3.rollup(
      dataFilter,
      v => v.length,
      d => d.workType
    ),
    ([type, count]) => ({ type, count })
  );

  if (workTypeCounts.length === 0) {
    console.warn("⚠️ No data available to render the pie chart.");
    return;
  }

  // Create pie layout
  const pie = d3.pie()
    .sort(null)
    .value(d => d.count);

  // Create arc generator
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // Draw pie slices
  const slices = g.selectAll("path")
    .data(pie(workTypeCounts))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.type))
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .on("mouseover", (event, d) => {
      tooltip.transition()
        .duration(200)
        .style("opacity", 1);

      tooltip.html(`<strong>Type:</strong> ${d.data.type}<br><strong>Permits:</strong> ${d.data.count}`)
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
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    });

  // Add text labels inside the pie slices
  g.selectAll("text")
    .data(pie(workTypeCounts))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "white")
    .text(d => d.data.type);

  // Add a title
  svg.append("text")
    .attr("class", "pie-title")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold");

}
