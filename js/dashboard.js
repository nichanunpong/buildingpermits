/*
CSIS 3860 Winter 2025
Dashboard Controller (dashboard.js)
Filters by selected IssueYear (no 'All Years' option)
*/
// Import all modules
import { loadCleanedData } from './cleanData.js';
import { renderMetrics } from './summaryMetrics.js';
import { renderLineChart } from './lineChart.js';
import { renderBarChart } from './barChart.js';
import { renderMapChart } from './mapChart.js';
import { renderPieChart } from './pieChart.js';
import { renderScatterPlot } from './scatterPlot.js';

// Global variables
let selectedYear = "2024";   // Default selected year is 2024
let fullData = [];           // Store the full dataset

// Function to update the dashboard with filtered data
function updateDashboard() {
  let filteredData = fullData.filter(d => d.year == selectedYear);
  let filteredDataPrevious = fullData.filter(d => d.year == selectedYear - 1);
  renderMetrics(filteredData, filteredDataPrevious);      // Update Summary Metrics
  renderLineChart(filteredData, filteredDataPrevious);     // Update Line Chart
  renderBarChart(filteredData, filteredDataPrevious);      // Update Bar Chart
  renderMapChart(filteredData);      // Update Map Chart
  renderPieChart(filteredData);      // Update Pie Chart
  renderScatterPlot(filteredData);      // Update Scatter Polt
}

// Function to populate the Year filter dropdown
function populateYearDropdown(data) {
  const years = Array.from(new Set(data.map(d => d.year)))
    .filter(y => y !== null && !isNaN(y))
    .sort((a, b) => b - a); // Sort descending (newest first)

  const dropdown = d3.select("#year-filter");

  // Only add real years (no 'All Years' option)
  years.forEach(year => {
    dropdown.append("option")
      .attr("value", year)
      .text(year);
  });

  // Set the default selected year
  dropdown.property("value", selectedYear);

  // Add event listener for year change
  dropdown.on("change", function () {
    selectedYear = this.value;
    updateDashboard();
  });
}

// Load and initialize the dashboard
loadCleanedData().then(data => {
  fullData = data;
  populateYearDropdown(fullData);
  updateDashboard();

  // console.log("\u2705 Dashboard loaded successfully with default year 2025.");
});
