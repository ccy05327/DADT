document.addEventListener("click", async () => {
  const regionSelectQ3 = document.getElementById("regionSelectQ3");
  const showDataBtnQ3 = document.getElementById("showDataBtnQ3");

  let chart;

  showDataBtnQ3.addEventListener("click", async () => {
    const selectedRegion = regionSelectQ3.value;

    if (!selectedRegion) {
      alert("Please select a region.");
      return;
    }

    // Fetch data for the selected region
    try {
      const response = await fetch(
        `/api/mortality-gender-differences?region=${selectedRegion}`
      );
      const data = await response.json();

      // Check if the data contains mortality data
      if (!data || data.length === 0) {
        console.error("No mortality data found.");
        alert("No data found for the selected region.");
        return;
      }

      // Prepare data for chart
      const allMortalityData = [];
      const maleMortalityData = [];
      const femaleMortalityData = [];

      data.forEach((item) => {
        // Populate chart data based on gender
        if (item.Sex === "Male") {
          maleMortalityData.push(item.TotalMortality);
        } else if (item.Sex === "Female") {
          femaleMortalityData.push(item.TotalMortality);
        } else if (item.Sex === "All") {
          allMortalityData.push(item.TotalMortality);
        }
      });

      if (chart) {
        chart.destroy();
      }

      // Create or update the chart
      const ctx = document.getElementById("deathRateChartQ3").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: "_", // keep it to just one column
          datasets: [
            {
              label: "Male Mortality",
              data: maleMortalityData,
              backgroundColor: "rgba(54, 162, 235, 0.2)", // Blue
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
            {
              label: "Female Mortality",
              data: femaleMortalityData,
              backgroundColor: "rgba(255, 99, 132, 0.2)", // Red
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
            {
              label: "All Mortality",
              data: allMortalityData,
              backgroundColor: "rgba(75, 192, 192, 0.2)", // Green
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {},
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. Please try again.");
    }
  });

  // Fetch the regions on page load
  fetchRegions();
});
