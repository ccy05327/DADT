// Attach a listener to ensure actions occur when a click event happens
document.addEventListener("click", async () => {
  const regionSelectQ3 = document.getElementById("regionSelectQ3"); // Dropdown for selecting a region
  const showDataBtnQ3 = document.getElementById("showDataBtnQ3"); // Button to display data for Q3

  if (regionSelectQ3) {
    const ctx = document.getElementById("deathRateChartQ3").getContext("2d"); // Canvas context for Chart.js

    let chart; // Variable to store the Chart.js instance

    // Event listener for displaying data on button click
    showDataBtnQ3.addEventListener("click", async () => {
      const selectedRegion = regionSelectQ3.value; // Get the selected region from the dropdown

      if (!selectedRegion) {
        alert("Q3 | Please select a region."); // Alert if no region is selected
        return;
      }

      try {
        // Fetch gender-related mortality data for the selected region
        const response = await fetch(
          `/api/mortality-gender-differences?region=${selectedRegion}`
        );

        if (!response.ok) {
          return; // Exit if the fetch request is unsuccessful
        }

        const data = await response.json();

        // Alert if no data is available for the selected region
        if (!data || data.length === 0) {
          alert("Q3 | No data found for the selected region.");
          return;
        }

        // Prepare arrays for chart data
        const allMortalityData = [];
        const maleMortalityData = [];
        const femaleMortalityData = [];

        // Iterate over the data and separate by gender categories
        data.forEach((item) => {
          if (item.Sex === "Male") {
            maleMortalityData.push(item.TotalMortality);
          } else if (item.Sex === "Female") {
            femaleMortalityData.push(item.TotalMortality);
          } else if (item.Sex === "All") {
            allMortalityData.push(item.TotalMortality);
          }
        });

        // Destroy existing chart to avoid duplication
        if (chart) {
          chart.destroy();
        }

        // Create a doughnut chart with Chart.js
        chart = new Chart(ctx, {
          type: "doughnut", // Doughnut chart to show proportional data
          data: {
            labels: ["Male", "Female", "All"], // Labels for the doughnut slices
            datasets: [
              {
                data: [
                  maleMortalityData,
                  femaleMortalityData,
                  allMortalityData,
                ], // Data for each slice
                backgroundColor: [
                  "rgba(54, 162, 235)", // Blue for males
                  "rgba(255, 99, 132)", // Red for females
                  "rgba(75, 192, 192)", // Green for all genders
                ],
                hoverOffset: 4, // Offset for hover effect
              },
            ],
          },
          options: {
            responsive: true, // Chart adjusts to container size
            cutout: "40%", // Create the inner hollow section
            aspectRatio: 1, // Maintain a square aspect ratio
            plugins: {
              legend: {
                position: "top", // Position the legend at the top
              },
            },
          },
        });
      } catch (error) {
        alert("Q3 | Error fetching data: " + error); // Alert user if an error occurs
      }
    });

    // Destroy chart when a new region is selected
    regionSelectQ3.addEventListener("change", async () => {
      if (chart) {
        chart.destroy();
      }
    });
  }
});
