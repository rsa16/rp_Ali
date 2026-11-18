var DATA_CSV = "data/phage_t4_ampicillin_mic_summary.csv";
var BAR_COLORS = ["#4285f4", "#ea4335", "#fbbc04", "#34a853", "#ff6d01"];
var BAR_HOVER_COLORS = ["#3367d6", "#c5221f", "#e8ab03", "#1e8e3e", "#e65100"];

// helper functions to help format labels
// \u00d7 changes to the multiplication sign to make it look nice
function tooltipLabel(label) {
  return label.replace(" x ", " \u00d7 ");
}

// we don't need the labels on the axis to have the unit too
// when it's already on the bottom
function axisLabel(label) {
  return tooltipLabel(label).replace(" PFU/mL", "");
}

function parseCsv(text) {
  return text
    .trim() // get rid of whitespace
    .split("\n") // split into lines
    .slice(1) // remove first row, column names
    .map(function (line) {
      // split each by comma and map everything into an array of objects
      var cells = line.split(",");
      return {
        label: cells[0].trim(),
        mean: Number(cells[1].trim()),
        sd: Number(cells[2].trim()),
      };
    });
}

function render(rows) {
  var chart = document.getElementById("mic-chart");
  var bodyFont = window.getComputedStyle(document.body).fontFamily;

  Chart.defaults.font.family = bodyFont;
  Chart.defaults.color = "#212529";

  // calculate the error bar range and pass standard deviation
  var data = rows.map(function (row) {
    return {
      y: row.mean,
      yMin: Math.max(0, row.mean - row.sd),
      yMax: row.mean + row.sd,
      sd: row.sd,
      fullLabel: tooltipLabel(row.label),
    };
  });

  // craete the chart
  new Chart(chart, {
    type: "barWithErrorBars", // using custom error bar plugin
    data: {
      labels: rows.map(function (row) {
        return axisLabel(row.label);
      }),
      datasets: [
        {
          data: data,
          backgroundColor: BAR_COLORS,
          hoverBackgroundColor: BAR_HOVER_COLORS,
          borderWidth: 0,
          borderRadius: 2,
          categoryPercentage: 0.68, // categoryPercentage controls how much of each slot can be used for a bar
          barPercentage: 0.82, // controls the width of the bar within the slot. both used to control spacing
          errorBarColor: "#212529",
          errorBarWhiskerColor: "#212529",
          errorBarLineWidth: 1.25,
          errorBarWhiskerLineWidth: 1.25,
          errorBarWhiskerSize: 14,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000 },
      layout: { padding: { top: 18, right: 8, left: 0, bottom: 0 } },
      interaction: { mode: "index", intersect: false }, // so we can hover the general area and have the tooltip still display
      scales: {
        x: {
          grid: { display: false },
          border: { color: "rgba(33, 37, 41, 0.35)" },
          ticks: {
            color: "#495057",
            font: { size: 12 },
            maxRotation: 0,
            autoSkip: false, // otherwise chart js hides the labels when theres not enough space
          },
          title: {
            display: true,
            text: "Phage Concentration (PFU/mL)",
            color: "#212529",
            font: { size: 13, weight: "600" },
            padding: { top: 10 },
          },
        },
        y: {
          beginAtZero: true,
          max: 40,
          border: { display: false },
          grid: { color: "rgba(33, 37, 41, 0.08)" },
          ticks: {
            stepSize: 10,
            color: "#6c757d",
            font: { size: 12 },
          },
          title: {
            display: true,
            text: "Mean MIC (\u03bcg/mL)",
            color: "#212529",
            font: { size: 13, weight: "600" },
            padding: { bottom: 10 },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          // custom tooltip
          backgroundColor: "#212529",
          padding: 10,
          displayColors: false,
          titleFont: { size: 13, weight: "600" },
          bodyFont: { size: 13 },
          bodySpacing: 4,
          callbacks: {
            title: (items) => items[0].raw.fullLabel,
            label: (item) => [
              "Mean MIC: " + String(item.raw.y) + " \u03bcg/mL",
              "SD: \u00b1" + String(item.raw.sd) + " \u03bcg/mL",
            ],
          },
        },
      },
    },
  });
}

fetch(DATA_CSV)
  .then((resp) => resp.text())
  .then((text) => render(parseCsv(text)))
  .catch((err) => {
    console.error("Could not load MIC data:", err);
  });
