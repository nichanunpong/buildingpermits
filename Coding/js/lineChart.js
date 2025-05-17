const width = 960;
const height = 500;

const svg = d3
  .select("#line-chart-svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("width", "100%")
  .attr("height", "100%");

// Exported function to render the Line Chart with filtered data
export function renderLineChart(data, previousData) {
  // Clear previous chart
  svg.selectAll("*").remove();

  // Define value accessors
  const xValue = d => d.month; // Just the month string (e.g., "2023-01")
  const yValue = d => d.count;

  // Check if the user clicked a province
  let clickValue = document.getElementById("click-value").value || "";
  let dataFilter = clickValue !== "" ? data.filter(d => d.geoLocalArea === clickValue) : data;
  let previousDataFilter = clickValue !== "" ? previousData.filter(d => d.geoLocalArea === clickValue) : previousData;

  // Group and count permits by month for both current and previous year
  const monthlyCountsCurrent = Array.from(
    d3.rollup(dataFilter, v => v.length, d => d.month.slice(5)), // Extract just month part ("01", "02", etc.)
    ([month, count]) => ({ month, count, year: "current" })
  );

  const monthlyCountsPrevious = Array.from(
    d3.rollup(previousDataFilter, v => v.length, d => d.month.slice(5)),
    ([month, count]) => ({ month, count, year: "previous" })
  );

  // Get all unique months from both datasets (should be same months)
  const allMonths = [...new Set([
    ...monthlyCountsCurrent.map(d => d.month),
    ...monthlyCountsPrevious.map(d => d.month)
  ])].sort();

  // Combine data for domain calculation
  const combinedData = [...monthlyCountsCurrent, ...monthlyCountsPrevious];

  // Set margins
  const margin = { top: 60, right: 40, bottom: 100, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = d3.scaleBand()
    .domain(allMonths)
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(combinedData, d => yValue(d))])
    .range([innerHeight, 0])
    .nice();

  // Create group container
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create X Axis
  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(10)
    .tickFormat(d => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[parseInt(d) - 1];
    });

  const xAxisG = g.append("g")
    .call(xAxis)
    .attr("transform", `translate(0,${innerHeight})`);

  xAxisG.select(".domain").remove();

  // Rotate X-axis labels to avoid overlapping
  xAxisG.selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em");

  xAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", 75)
    .attr("x", innerWidth / 2)
    .attr("fill", "black");

  // Create Y Axis
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

  const yAxisG = g.append("g").call(yAxis);

  yAxisG.select(".domain").remove();

  yAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", -70)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")

  // Create line generator
  const lineGenerator = d3.line()
    .x(d => xScale(d.month) + xScale.bandwidth() / 2)
    .y(d => yScale(yValue(d)));

  // Draw the current year line
  g.append("path")
    .datum(monthlyCountsCurrent.sort((a, b) => a.month.localeCompare(b.month)))
    .attr("class", "line-path current-year")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", lineGenerator);

  // Draw the previous year line
  g.append("path")
    .datum(monthlyCountsPrevious.sort((a, b) => a.month.localeCompare(b.month)))
    .attr("class", "line-path previous-year")
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,3")
    .attr("d", lineGenerator);

  // Tooltip
  const tooltip = d3.select("#tooltip");

  // Function to handle tooltip for both datasets
  function handleTooltip(event, d, yearType) {
    tooltip.transition().duration(200).style("opacity", 1);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[parseInt(d.month) - 1];

    const yearLabel = yearType === "current" ? "Current Year" : "Previous Year";
    tooltip.html(`<strong>${monthName}</strong><br/>${yearLabel}<br/>Permits: ${d.count}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");

    d3.select(this)
      .classed("highlighted", true);
  }

  // Draw dots for current year
  g.selectAll(".current-year-circle")
    .data(monthlyCountsCurrent)
    .enter()
    .append("circle")
    .attr("class", "line-chart-point current-year")
    .attr("cx", d => xScale(d.month) + xScale.bandwidth() / 2)
    .attr("cy", d => yScale(yValue(d)))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      handleTooltip(event, d, "current");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(300).style("opacity", 0);
      d3.select(this).classed("highlighted", false);
    });

  // Draw dots for previous year
  g.selectAll(".previous-year-circle")
    .data(monthlyCountsPrevious)
    .enter()
    .append("circle")
    .attr("class", "line-chart-point previous-year")
    .attr("cx", d => xScale(d.month) + xScale.bandwidth() / 2)
    .attr("cy", d => yScale(yValue(d)))
    .attr("r", 4)
    .attr("fill", "orange")
    .on("mouseover", function (event, d) {
      handleTooltip(event, d, "previous");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(300).style("opacity", 0);
      d3.select(this).classed("highlighted", false);
    });

  // Add legend
  const legend = g.append("g")
    .attr("transform", `translate(${innerWidth - 150}, 20)`);

  legend.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "steelblue");

  legend.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text("Current Year")
    .style("font-size", "12px");

  legend.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("y", 20)
    .attr("fill", "orange");

  legend.append("text")
    .attr("x", 20)
    .attr("y", 30)
    .text("Previous Year")
    .style("font-size", "12px");
}