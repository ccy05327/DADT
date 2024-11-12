document.addEventListener("click", async () => {
  const countrySelectQ4 = document.getElementById("countrySelectQ4");
  const showDataBtnQ4 = document.getElementById("showDataBtnQ4");

  if (countrySelectQ4) {
    const ctx = document.getElementById("deathRateChartQ4").getContext("2d");

    let chart;

    showDataBtnQ4.addEventListener("click", async () => {
      const country = countrySelectQ4.value;

      if (!country) {
        alert("Q4 | Please select a country.");
        return;
      }

      try {
        const response = await fetch(
          `/api/yearly-mortality-by-country?country=${country}`
        );

        if (!response.ok) {
          return;
        }
        const data = await response.json();

        // Check if the data contains mortality data
        if (!data || data.length === 0) {
          alert("Q4 | No data found for the selected country.");
          return;
        }

        // Prepare data for chart
        const years = data.map((row) => row.Year);
        const mortalityNumbers = data.map((row) => row.TotalMortality);

        // if (chart) {
        //   chart.destroy();
        // }

        // Create or update the chart
        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: years,
            datasets: [
              {
                label: "Mortality Number",
                data: mortalityNumbers,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Year",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Mortality Number",
                },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
          },
        });
      } catch (error) {
        console.error(error);
        alert("Q4 | An error occurred while fetching the data.");
      }
    });

    countrySelectQ4.addEventListener("change", async () => {
      if (chart) {
        chart.destroy();
      }
    });
  }
});
