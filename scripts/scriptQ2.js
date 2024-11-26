// Wait for the DOM to fully load before executing scripts
document.addEventListener("DOMContentLoaded", async () => {
  const regionSelectQ2 = document.getElementById("regionSelectQ2"); // Dropdown for region selection
  const ageGroupSelect = document.getElementById("ageGroupSelect"); // Dropdown for age group selection
  const showDataBtnQ2 = document.getElementById("showDataBtnQ2"); // Button to fetch and display data

  if (regionSelectQ2 && ageGroupSelect) {
    const ctx = document.getElementById("deathRateChartQ2").getContext("2d"); // Canvas context for Chart.js

    let chart; // Variable to store the Chart.js instance

    // Add event listener to handle button clicks for data fetching
    showDataBtnQ2.addEventListener("click", async () => {
      const selectedRegion = regionSelectQ2.value; // Get the selected region
      const selectedAgeGroup = ageGroupSelect.value; // Get the selected age group

      if (!selectedRegion || !selectedAgeGroup) {
        alert("Q2 | Please select both a region and an age group."); // Alert if selections are incomplete
        return;
      }

      try {
        // Fetch mortality data based on selected region and age group
        const response = await fetch(
          `/api/mortality-by-age-group-in-regions?region=${selectedRegion}&ageGroup=${selectedAgeGroup}`
        );

        if (!response.ok) {
          return; // Exit if the response is not successful
        }

        const data = await response.json();

        const regionName = data.map((item) => item.RegionName); // Extract region names
        const dataValues = data.map((item) => item.TotalMortality); // Extract mortality counts

        // Show or hide the "no data" message based on the response
        if (regionName.length === 0 || dataValues.length === 0) {
          document.getElementById("noDataMessage").style.display = "block";
          return;
        } else {
          document.getElementById("noDataMessage").style.display = "none";
        }

        // Destroy the previous chart if it exists
        if (chart) {
          chart.destroy();
        }

        // Create a new bar chart using Chart.js
        chart = new Chart(ctx, {
          type: "bar", // Bar chart for visualizing data
          data: {
            labels: regionName, // X-axis labels (region names)
            datasets: [
              {
                label: "Total Mortality Count", // Legend label
                data: dataValues, // Y-axis data (mortality counts)
                backgroundColor: regionName.map(
                  (region) =>
                    region === selectedRegion
                      ? "rgba(255, 99, 132, 0.5)" // Highlight selected region in red
                      : "rgba(75, 192, 192, 0.5)" // Default color for other regions
                ),
                borderColor: regionName.map(
                  (region) =>
                    region === selectedRegion
                      ? "rgba(255, 99, 132, 1)" // Highlight border color for the selected region
                      : "rgba(75, 192, 192, 1)" // Default border color for other regions
                ),
                borderWidth: 1, // Bar border width
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true, // Y-axis starts at zero
              },
            },
          },
        });
      } catch (error) {
        console.error(error); // Log errors to the console
        alert(
          "Q2 | An error occurred fetching data: " +
            error +
            selectedRegion +
            selectedAgeGroup
        ); // Alert for errors
      }
    });

    // Destroy the chart when the region selection changes
    regionSelectQ2.addEventListener("change", async () => {
      if (chart) {
        chart.destroy();
      }
    });

    // Destroy the chart when the age group selection changes
    ageGroupSelect.addEventListener("change", async () => {
      if (chart) {
        chart.destroy();
      }
    });

    // Hide the "no data" message initially
    document.getElementById("noDataMessage").style.display = "none";
  }
});
