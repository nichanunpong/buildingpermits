import { renderMapChart } from './mapChart.js';
import { renderLineChart } from './lineChart.js';
import { renderPieChart } from './pieChart.js';


const width = 960;
const height = 550;

const svg = d3
  .select("#bar-chart-svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet") //preserve the aspect ratio of the SVG to be middle aligned and meet the container size
  .attr("width", "100%")
  .attr("height", "100%"); // In order for the height to be responsive, its parent element must have a defined height



// Exported function to render Bar Chart with filtered data
export function renderBarChart(data, filteredDataPrevious) {
  // Clear previous chart
  svg.selectAll("*").remove();

  // Group data by neighborhood and calculate total project value
  const valueByNeighborhood = Array.from(
    d3.rollup(
      data,
      v => d3.sum(v, d => d.value),
      d => d.geoLocalArea
    ),
    ([neighborhood, totalValue]) => ({ neighborhood, totalValue })
  );

  // Sort neighborhoods by descending total project value
  valueByNeighborhood.sort((a, b) => d3.descending(a.totalValue, b.totalValue));

  // ⏩ Only keep the top 10 neighborhoods
  const top10Neighborhoods = valueByNeighborhood.slice(0, 10);

  // Set margins and compute inner chart dimensions
  const margin = { top: 60, right: 40, bottom: 100, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = d3.scaleBand()
    .domain(top10Neighborhoods.map(d => d.neighborhood))
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(top10Neighborhoods, d => d.totalValue)])
    .range([innerHeight, 0])
    .nice();

  // Create group container
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create X Axis
  const xAxis = d3.axisBottom(xScale);

  const xAxisG = g.append("g")
    .call(xAxis)
    .attr("transform", `translate(0,${innerHeight})`);

  xAxisG.selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em");

  xAxisG.select(".domain").remove();

  xAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", 70)
    .attr("x", innerWidth / 2)
    .attr("fill", "black");
  // .text("Neighborhood");

  // Create Y Axis
  const yAxis = d3.axisLeft(yScale)
    .tickValues(d3.range(0, yScale.domain()[1] + 100000000, 100000000))  // Tick every 100 million
    .tickFormat(d3.format("$.2s"));

  const yAxisG = g.append("g").call(yAxis);

  yAxisG.select(".domain").remove();

  yAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", -70)
    .attr("x", -innerHeight / 2)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "black")
  // .text("Total Project Value");

  // Draw bars
  g.selectAll("rect")
    .data(top10Neighborhoods)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.neighborhood))
    .attr("y", d => yScale(d.totalValue))
    .attr("width", xScale.bandwidth())
    .attr("height", d => innerHeight - yScale(d.totalValue));

  // Tooltip setup
  const tooltip = d3.select("#tooltip");
  g.selectAll(".bar")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(300)      // smooth in 0.2 sec
        .attr("width", xScale.bandwidth() * 1.2)   // make wider
        .attr("fill", "orange");
      tooltip.transition()
        .duration(200)
        .style("opacity", 1);

      tooltip.html(`<strong>${d.neighborhood}</strong><br>Total Value: $${d3.format(",.0f")(d.totalValue)}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("width", xScale.bandwidth())   // return to normal width
        .attr("fill", null); // Reset color
      tooltip.transition()
        .duration(300)
        .style("opacity", 0);
    })
    //  Add this click event
    .on("click", function (event, d) {

      let clickValue = document.getElementById("click-value").value;
      if (clickValue === d.neighborhood) {
        document.getElementById("click-value").value = "";
      } else {
        document.getElementById("click-value").value = d.neighborhood;
      }

      renderMapChart(data);
      renderLineChart(data, filteredDataPrevious);
      renderPieChart(data);

    });
}

