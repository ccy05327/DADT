document.addEventListener("DOMContentLoaded", async () => {
  const regionSelectQ2 = document.getElementById("regionSelectQ2");
  const ageGroupSelect = document.getElementById("ageGroupSelect");
  const showDataBtnQ2 = document.getElementById("showDataBtnQ2");
  const deathRateChartQ2 = document.getElementById("deathRateChartQ2");

  let chart;

  showDataBtnQ2.addEventListener("click", async () => {
    const selectedRegion = regionSelectQ2.value;
    const selectedAgeGroup = ageGroupSelect.value;

    if (!selectedRegion || !selectedAgeGroup) {
      alert("Please select both a high-data region and an age group.");
      return;
    }

    try {
      const response = await fetch(
        `/api/mortality-by-age-group-high-data?region=${selectedRegion}&ageGroup=${selectedAgeGroup}`
      );
      const data = await response.json();

      // Check if the data contains mortality data
      if (!data.mortalityData || data.mortalityData.length === 0) {
        console.error("No mortality data found.");
        alert("No data found for the selected region and age group.");
        return;
      }

      const labels = data.mortalityData.map((row) => row.AgeGroup);
      const dataValues = data.mortalityData.map((row) =>
        Number(row.TotalMortalityCount)
      ); // Convert string to number

      // Chart.js code
      if (chart) {
        chart.destroy(); // destroy previous chart if exists
      }

      const ctx = document.getElementById("deathRateChartQ2").getContext("2d");
      chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Mortality Count",
              data: dataValues,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching the data.");
    }
  });

  // Fetch the regions on page load
  fetchRegions();
});
