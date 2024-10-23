import { Scatter } from "react-chartjs-2";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ScoreComparisonScatter = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch("/api/ageGroupScores");
        const result = await response.json();

        // Prepare data for the scatter chart
        const scatterData = result.map((entry) => ({
          x: entry.age, // Use age directly
          y: entry.avgScore || 0, // Use the average score
          label: entry.isTranslated ? "Translated" : "Original", // Differentiate points
        }));

        setData(scatterData);
      } catch (error) {
        console.error("Error fetching comparison scores:", error);
      }
    };

    fetchScores();
  }, []);

  // Prevent rendering the chart if there's no data
  if (!data.length) {
    return <p>No data available for score comparison.</p>;
  }

  const scatterChartData = {
    datasets: [
      {
        label: "Original Documents",
        data: data.filter((point) => !point.label.includes("Translated")),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        pointRadius: 5,
      },
      {
        label: "Translated Documents",
        data: data.filter((point) => point.label.includes("Translated")),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Age",
        },
        ticks: {
          autoSkip: false, // Show all tick labels
          maxRotation: 0, // Prevent rotation of labels
        },
      },
      y: {
        title: {
          display: true,
          text: "Average Score",
        },
        min: 0,
        max: 5,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Avg Score: ${tooltipItem.raw.y} (${tooltipItem.dataset.label})`; // Display average score and label on hover
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <h2>Average Score by Age Group</h2>
      <Scatter data={scatterChartData} options={options} />
    </div>
  );
};

export default ScoreComparisonScatter;
