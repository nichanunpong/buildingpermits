export function renderMetrics(data, previousData) {
  // Metrics for current year
  const totalPermits = data.length;
  const totalValue = d3.sum(data, d => d.value);
  const avgValue = totalPermits > 0 ? (totalValue / totalPermits) : 0;

  const topNeighborhood = d3.rollup(
    data,
    v => v.length,
    d => d.geoLocalArea
  );
  const sortedNeighborhoods = Array.from(topNeighborhood.entries())
    .sort((a, b) => d3.descending(a[1], b[1]));
  const topNeighborhoodName = sortedNeighborhoods.length > 0 ? sortedNeighborhoods[0][0] : "N/A";
  const topNeighborhoodCount = sortedNeighborhoods.length > 0 ? sortedNeighborhoods[0][1] : 0;

  const topWorkType = d3.rollup(
    data,
    v => v.length,
    d => d.workType
  );
  const sortedWorkTypes = Array.from(topWorkType.entries())
    .sort((a, b) => d3.descending(a[1], b[1]));
  const topWorkTypeName = sortedWorkTypes.length > 0 ? sortedWorkTypes[0][0] : "N/A";
  const topWorkTypeCount = sortedWorkTypes.length > 0 ? sortedWorkTypes[0][1] : 0;

  // Metrics for previous year
  const previousTotalPermits = previousData.length;
  const previousTotalValue = d3.sum(previousData, d => d.value);
  const previousAvgValue = previousTotalPermits > 0 ? (previousTotalValue / previousTotalPermits) : 0;

  // --- Helper function ---
  function calcPercentChange(current, previous) {
    if (previous === 0) return "N/A";
    const change = ((current - previous) / previous) * 100;
    const formatted = d3.format("+.1f")(change);
    return `${formatted}%`;
  }

  // Calculate percentage changes
  const permitsChange = calcPercentChange(totalPermits, previousTotalPermits);
  const valueChange = calcPercentChange(totalValue, previousTotalValue);
  const avgValueChange = calcPercentChange(avgValue, previousAvgValue);

  // Update Metric Cards
  d3.select("#total-permits").html(`
    <h3>Total Permits</h3>
    <p>${d3.format(",")(totalPermits)} <br><span style="font-size:14px; color:gray;">(${permitsChange})</span></p>
  `);

  d3.select("#total-value").html(`
    <h3>Total Project Value</h3>
    <p>$${d3.format(",.0f")(totalValue)}<br><span style="font-size:14px; color:gray;">(${valueChange})</span></p>
  `);

  d3.select("#avg-value").html(`
    <h3>Average Project Value</h3>
    <p>$${d3.format(",.0f")(avgValue)}<br> <span style="font-size:14px; color:gray;">(${avgValueChange})</span></p>
  `);
}
