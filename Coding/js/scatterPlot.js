const width = 960;
const height = 500;

const svg = d3
  .select("#scatter-plot-svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet") //preserve the aspect ratio of the SVG to be middle aligned and meet the container size
  .attr("width", "100%")
  .attr("height", "100%"); // In order for the height to be responsive, its parent element must have a defined height


// A Helper function to capitalize the first letter of a string
const capFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Exported function to render the Line Chart with filtered data
export function renderScatterPlot(data) {
  // Clear previous chart
  svg.selectAll("*").remove();
  //  value accessor for x and create the x-axis label
  const xValue = (d) => d.elapsedDays;
  const xAxisLabel = "Elapsed Days";

  // value accessor for y and create the y-axis label
  const yValue = (d) => d.value;
  const yAxisLabel = "Value";

  // Create the title for the scatter plot dynamically
  // const title = "XX: Elapsed Days vs Value";

  // Set the margin, inner width/height and circle radius for the plot
  const margin = { top: 60, right: 40, bottom: 90, left: 150 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const circleRadius = 7;

  // Create the scales for the x and y axes
  const xScale = d3
    .scaleLinear() // Use scaleLinear for continuous data on the x-axis
    .domain(d3.extent(data, xValue)) // Get the min and max values of the x-axis data
    .range([0, innerWidth])
    .nice(); // Use nice() to avoid grid lines at the edges

  const yScale = d3
    .scaleLinear() // Use scaleLinear for continuous data on the y-axis
    .domain(d3.extent(data, yValue)) // Get the min and max values of the y-axis data
    .range([0, innerHeight])
    .nice();

  // Create a group element to hold the entire plot
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const formatMillion = d3.format(".2s");  // Short format like 1.5M, 2.0M, etc.
  // Create the x-axis with custom tick size (grid lines)
  // and tick padding so the ticks are not too close to the axis
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(formatMillion)   // Format the number
    .tickSize(-innerHeight)
    .tickPadding(15);


  // Create the x-axis group to hold the axis and label
  // and set its position at the bottom of the plot
  const xAxisG = g
    .append("g")
    .call(xAxis) // Call the x-axis function to create the axis under the xAxis group
    .attr("transform", `translate(0,${innerHeight})`);


  // Remove the default domain line and add a label
  xAxisG.select(".domain").remove();
  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 75)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(xAxisLabel);


  // Similarly, create the y-axis with custom tick size (grid lines) and tick padding
  const yAxis = d3.axisLeft(yScale)
    .tickValues(d3.range(0, yScale.domain()[1] + 50000000, 50000000))  // Tick every 50 million
    .tickFormat(formatMillion)  // Format as M
    .tickSize(-innerWidth)
    .tickPadding(10);

  const yAxisG = g.append("g").call(yAxis); // Call the y-axis function to create the axis under the yAxis group

  // Remove the default domain line and add a label
  yAxisG.select(".domain").remove();
  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -90)
    .attr("x", -innerHeight / 2) // Positions the text anchor at the middle of the Y-axis height
    .attr("fill", "black") // Explicitly set the text color to black otherwise it won't be visible
    .attr("transform", "rotate(-90)") // Rotates the text to be vertical
    .attr("text-anchor", "middle") // Centers the text horizontally around the anchor point
    .text(yAxisLabel);

  // Create the circles for each data point and append them to the chart to create the scatter plot
  g.selectAll("circle")
    .data(data)
    .enter() // Use enter() to bind data because we are creating new elements
    .append("circle")
    .attr("class", "circle")
    .attr("cy", (d) => yScale(yValue(d))) // Set the centroid's y position of each circle based on the yScale
    .attr("cx", (d) => xScale(xValue(d))) // Set the centroid's x position of each circle based on the xScale
    .attr("r", circleRadius);

  // Tooltip setup
  const tooltip = d3.select("#tooltip");
  g.selectAll(".circle")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "orange");

      tooltip.transition()
        .duration(200)
        .style("opacity", 1);

      tooltip.html(`<strong>Elapsed ${d.elapsedDays} Days</strong><br>Value: $${d3.format(",.0f")(d.value)}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill", null); // Reset color
      tooltip.transition()
        .duration(300)
        .style("opacity", 0);
    })

}
