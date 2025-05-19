## 1. Dataset Source & Preprocessing

- **Dataset name:** Issued building permits  
- **Source:** City of Vancouver Open Data  
- **URL:** https://opendata.vancouver.ca/explore/dataset/issued-building-permits/information/  
- **Date range:** 2017–2025 (website shows 2020–2024)

**Preprocessing steps:**
1. **Download** the raw CSV from the Open Data portal.  
2. **Clean the data:**
   - Count missing/null values per column.  
   - Fill optional fields where appropriate.  
   - Standardize and convert data types (e.g. dates, numbers).  
   - Check for duplicate Permit Numbers (none found).  
3. **Format** the cleaned dataset for D3.js consumption (e.g. JSON or well-structured CSV).

---

## 2. How to Use This Report

- **Year Filter:** Use the dropdown in the top-right to select a year (2020–2024). All charts will update dynamically.  
- **Interactions:**  
  - **Hover** over data points for tooltips.  
  - **Click** bars/slices to drill down.  
  - **Pan & zoom** maps where supported.

---

## 3. Page Overview

Use the left-hand menu to navigate:

- **Home**  
  Overview of the dataset & a link to the original source.  
- **Dashboard**  
  Yearly summary:  
  - Total permits issued  
  - Total project value  
  - Average project value (vs. previous year)  
- **Project Value by Neighborhood** (Bar Chart)  
  Top 10 neighborhoods ranked by total permit value.  
- **Monthly Permits Issued** (Line Chart)  
  Permits issued each month, showing seasonal trends.  
- **Building Permit Locations** (Map)  
  Geographic distribution of permits across Vancouver’s neighborhoods.  
- **Distribution of Permits** (Pie Chart)  
  Breakdown by permit type (e.g., New Building, Addition/Alteration).  
- **Elapsed Days vs. Project Value** (Scatter Plot)  
  Relationship between project duration and monetary value.

---

## 4. What to Look For

1. **Home:**  
   Read dataset details and follow the link to the raw data.  
2. **Dashboard:**  
   Quick snapshot of yearly changes—watch for spikes or dips.  
3. **Bar Chart:**  
   Which neighborhoods dominate in project investment?  
4. **Line Chart:**  
   Are there months with consistently higher permit volume?  
5. **Map:**  
   Identify hotspots of building activity geographically.  
6. **Pie Chart:**  
   Which types of projects are most common?  
7. **Scatter Plot:**  
   Do longer projects tend to have higher values, or is there no clear pattern?

---

*Feel free to tweak any labels or descriptions to match your exact UI.*
