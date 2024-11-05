document.addEventListener("DOMContentLoaded", () => {
  const showDataBtn = document.getElementById("showDataBtn");
  const regionSelect = document.getElementById("regionSelect");

  const ctx = document.getElementById("deathRateChart").getContext("2d");

  let chart;

  showDataBtn.addEventListener("click", async () => {
    const selectedRegion = regionSelect.value;

    if (!selectedRegion) {
      alert("Please select a region.");
      return;
    }

    try {
      const response = await fetch(
        `/api/mortality-by-age-group-region?region=${selectedRegion}`
      );
      const data = await response.json();

      const ageGroups = [];
      const totalMortalityCounts = [];

      // Collect data for the chart
      data.forEach((item) => {
        ageGroups.push(item.AgeRange);
        totalMortalityCounts.push(item.TotalMortalityCount);
      });

      // Chart.js code
      if (chart) {
        chart.destroy(); // destroy previous chart if exists
      }

      chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ageGroups,
          datasets: [
            {
              label: "Total Mortality Count",
              data: totalMortalityCounts,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Total Mortality Count",
              },
            },
            x: {
              title: {
                display: true,
                text: "Age Group",
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
});
