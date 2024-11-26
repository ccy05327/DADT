document.addEventListener("DOMContentLoaded", async () => {
  const countrySelectQ4 = document.getElementById("countrySelectQ4"); // Dropdown for selecting a country
  const yearSelectStartQ4 = document.getElementById("yearSelectStartQ4"); // Start year selection
  const yearSelectEndQ4 = document.getElementById("yearSelectEndQ4"); // End year selection
  const showDataBtnQ4 = document.getElementById("showDataBtnQ4"); // Button to display data for Q4

  if (countrySelectQ4) {
    const ctx = document.getElementById("deathRateChartQ4").getContext("2d"); // Canvas context for Chart.js
    let chart; // Variable to store the Chart.js instance

    // Event listener for displaying data when the button is clicked
    showDataBtnQ4.addEventListener("click", async () => {
      const country = countrySelectQ4.value; // Get the selected country
      const startYear = yearSelectStartQ4.value || ""; // Get the selected start year
      const endYear = yearSelectEndQ4.value || ""; // Get the selected end year

      let queryParams = `country=${encodeURIComponent(country)}`; // Start building the query params
      if (startYear)
        queryParams += `&startYear=${encodeURIComponent(startYear)}`; // Add start year if available
      if (endYear) queryParams += `&endYear=${encodeURIComponent(endYear)}`; // Add end year if available

      if (!country) {
        alert("Q4 | Please select a country."); // Alert if no country is selected
        return;
      }

      if (startYear > endYear)
        alert("The Start Year has to be earlier than End Year."); // Alert if the start year is later than the end year

      try {
        // Fetch mortality data for the selected country and year range
        const response = await fetch(
          `/api/yearly-mortality-by-country?${queryParams}`
        );

        if (!response.ok) {
          alert("Network response was not ok"); // Alert if the response is not okay
          return;
        }
        const data = await response.json(); // Parse the response as JSON

        // Check if the data contains mortality data
        if (!data || data.length === 0) {
          alert("Q4 | No data found for the selected country."); // Alert if no data is found
          return;
        }

        // Prepare data for the chart
        const years = data.map((row) => row.Year); // Get the years from the data
        const mortalityNumbers = data.map((row) => row.TotalMortality); // Get the mortality numbers

        // Destroy the previous chart instance if it exists (optional, commented out)
        // if (chart) {
        //   chart.destroy();
        // }

        // Create or update the chart
        chart = new Chart(ctx, {
          type: "line", // Line chart for showing mortality trends over time
          data: {
            labels: years, // X-axis labels (years)
            datasets: [
              {
                label: "Mortality Number", // Dataset label
                data: mortalityNumbers, // Data for mortality numbers
                backgroundColor: "rgba(75, 192, 192, 0.2)", // Light blue background color
                borderColor: "rgba(75, 192, 192, 1)", // Blue border color
                borderWidth: 2, // Border width
                fill: false, // Do not fill the area under the line
              },
            ],
          },
          options: {
            responsive: true, // Make the chart responsive
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Year", // Label for the x-axis
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Mortality Number", // Label for the y-axis
                },
                beginAtZero: true, // Start the y-axis from zero
              },
            },
            plugins: {
              legend: {
                display: true, // Display the legend
                position: "top", // Position the legend at the top
              },
            },
          },
        });
      } catch (error) {
        console.error(error); // Log error if any
        alert("Q4 | An error occurred while fetching the data."); // Alert if an error occurs
      }
    });

    // Destroy the chart when the country selection changes
    countrySelectQ4.addEventListener("change", async () => {
      if (chart) {
        chart.destroy();
      }
    });
  }
});
