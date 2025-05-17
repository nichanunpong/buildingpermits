// Exported function to load and clean permit data (filtered to 2020–2024)
export async function loadCleanedData() {
  // Step 1: Load raw CSV data]
  const raw = await d3.csv("data/issued-building-permits.csv");
  console.log("Total rows loaded:", raw.length);

  // Step 1.5: Filter data by IssueYear 2020–2024
  const filteredRaw = raw.filter(d => {
    const year = +d.IssueYear;
    return year >= 2020 && year <= 2024;
  });
  console.log("Filtered rows (2020–2024):", filteredRaw.length);

  // Step 2: Count nulls before cleaning
  const columnNullCounts = {};
  const columns = Object.keys(filteredRaw[0]);
  columns.forEach(col => columnNullCounts[col] = 0);

  filteredRaw.forEach(row => {
    columns.forEach(col => {
      const value = row[col];
      if (value === undefined || value === null || value.trim() === "") {
        columnNullCounts[col]++;
      }
    });
  });

  console.log("Null value count before cleaning:", columnNullCounts);

  // Helper to normalize text values
  const normalize = v => (v || "").trim().toLowerCase();

  // Step 3: Clean and transform each row
  const data = filteredRaw.map(d => {
    const [lat, lon] = d.geo_point_2d && d.geo_point_2d.includes(',')
      ? d.geo_point_2d.split(",").map(Number)
      : [0, 0];

    const createdDate = d.PermitNumberCreatedDate ? new Date(d.PermitNumberCreatedDate) : null;
    const issueDate = d.IssueDate ? new Date(d.IssueDate) : null;

    return {
      permitNumber: d.PermitNumber || "Missing",
      createdDate,
      issueDate,
      elapsedDays: d.PermitElapsedDays === "" || d.PermitElapsedDays === undefined ? 0 : +d.PermitElapsedDays,
      value: isNaN(+d.ProjectValue) ? 0 : +d.ProjectValue,
      workType: d.TypeOfWork || "Other",
      address: d.Address || "Other",
      description: d.ProjectDescription || "No description available",
      category: ["", "unspecified", "not specified"].includes(normalize(d.PermitCategory))
        ? "Other"
        : d.PermitCategory || "Other",
      applicant: d.Applicant || "Other",
      applicantAddress: d.ApplicantAddress || "Other",
      propertyUse: d.PropertyUse || "Other",
      specificUse: d.SpecificUseCategory || "Other",
      contractor: d.BuildingContractor || "Other",
      contractorAddress: d.BuildingContractorAddress || "Other",
      year: +d.IssueYear || null,
      geoLocalArea: d.GeoLocalArea || "Other",
      month: d.YearMonth || "Other",
      latitude: lat,
      longitude: lon
    };
  });

  // Step 4: Check for duplicate permit numbers
  const seen = new Set();
  let duplicateCount = 0;
  data.forEach(d => {
    if (seen.has(d.permitNumber)) {
      duplicateCount++;
    } else {
      seen.add(d.permitNumber);
    }
  });

  console.log("Duplicate permit numbers found:", duplicateCount);

  // Step 5: Count null/undefined values after cleaning
  const cleanedNullCounts = {};
  const cleanedColumns = Object.keys(data[0]);
  cleanedColumns.forEach(col => cleanedNullCounts[col] = 0);

  data.forEach(row => {
    cleanedColumns.forEach(col => {
      const value = row[col];
      if (value === undefined || value === null) {
        cleanedNullCounts[col]++;
      }
    });
  });

  console.log("Null value count after cleaning:", cleanedNullCounts);

  return data;
}
