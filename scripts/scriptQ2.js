document.addEventListener("DOMContentLoaded", async () => {
  const regionSelectQ2 = document.getElementById("regionSelectQ2");
  const ageGroupSelect = document.getElementById("ageGroupSelect");
  const showDataBtnQ2 = document.getElementById("showDataBtnQ2");

  let chart;

  showDataBtnQ2.addEventListener("click", async () => {
    const selectedRegion = regionSelectQ2.value;
    const selectedAgeGroup = ageGroupSelect.value;

    if (!selectedRegion || !selectedAgeGroup) {
      alert("Please select both a region and an age group.");
      return;
    }

    try {
      const response = await fetch(
        `/api/mortality-by-age-group-in-regions?region=${selectedRegion}&ageGroup=${selectedAgeGroup}`
      );
      const data = await response.json();

      const regionName = data.map((item) => item.RegionName);
      const dataValues = data.map((item) => item.TotalMortality);

      if (regionName.length === 0 || dataValues.length === 0) {
        document.getElementById("noDataMessage").style.display = "block";
        return;
      } else {
        document.getElementById("noDataMessage").style.display = "none";
      }

      // Chart.js code
      if (chart) {
        chart.destroy(); // destroy previous chart if exists
      }

      const ctx = document.getElementById("deathRateChartQ2").getContext("2d");
      chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: regionName,
          datasets: [
            {
              label: "Total Mortality Count",
              data: dataValues,
              backgroundColor: regionName.map((region) =>
                region === selectedRegion
                  ? "rgba(255, 99, 132, 0.2)"
                  : "rgba(75, 192, 192, 0.2)"
              ),
              borderColor: regionName.map((region) =>
                region === selectedRegion
                  ? "rgba(255, 99, 132, 1)"
                  : "rgba(75, 192, 192, 1)"
              ),
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

  // Initial setup for the no data message block
  document.getElementById("noDataMessage").style.display = "none";
});
