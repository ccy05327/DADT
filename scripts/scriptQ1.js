// Wait for the DOM to fully load before executing scripts
document.addEventListener("DOMContentLoaded", () => {
  const showDataBtnQ1 = document.getElementById("showDataBtnQ1"); // Button to fetch and display data
  const regionSelectQ1 = document.getElementById("regionSelectQ1"); // Dropdown for region selection

  if (regionSelectQ1) {
    const ctx = document.getElementById("deathRateChartQ1").getContext("2d"); // Canvas context for Chart.js

    let chart; // Variable to store the Chart.js instance

    // Add event listener to handle button clicks for data fetching
    showDataBtnQ1.addEventListener("click", async () => {
      const selectedRegion = regionSelectQ1.value; // Get the selected region

      if (!selectedRegion) {
        alert("Q1 | Please select a region."); // Alert if no region is selected
        return;
      }

      try {
        // Fetch mortality data for the selected region
        const response = await fetch(
          `/api/mortality-by-age-group-region?region=${selectedRegion}`
        );
        if (!response.ok) {
          return; // Exit if the response is not successful
        }
        const data = await response.json();

        const ageGroups = []; // Stores age group labels
        const totalMortalityCounts = []; // Stores corresponding mortality counts

        // Process fetched data and populate arrays for the chart
        data.forEach((item) => {
          ageGroups.push(item.AgeRange); // Add age group
          totalMortalityCounts.push(item.TotalMortalityCount); // Add mortality count
        });

        // Create or update a Chart.js bar chart
        if (chart) {
          chart.destroy(); // Destroy the previous chart if it exists
        }

        chart = new Chart(ctx, {
          type: "bar", // Bar chart for visualizing data
          data: {
            labels: ageGroups, // X-axis labels
            datasets: [
              {
                label: "Total Mortality Count", // Legend label
                data: totalMortalityCounts, // Y-axis data
                backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
                borderColor: "rgba(75, 192, 192, 1)", // Border color
                borderWidth: 1, // Border width
              },
            ],
          },
          options: {
            responsive: true, // Make chart responsive
            scales: {
              y: {
                beginAtZero: true, // Y-axis starts from zero
                title: {
                  display: true,
                  text: "Total Mortality Count", // Y-axis title
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Age Group", // X-axis title
                },
              },
            },
          },
        });
      } catch (error) {
        console.error("Q1 | Error fetching data:", error); // Log fetch errors
      }
    });
  }
});
