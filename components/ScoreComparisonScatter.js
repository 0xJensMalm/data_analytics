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
          x: entry.ageGroup, // Use age directly
          y: entry.avgScore || 0, // Use the average score
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
        label: "Average Score by Age Group",
        data: data,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true, // Make the chart responsive
    maintainAspectRatio: false, // Disable the aspect ratio to use full height
    scales: {
      x: {
        title: {
          display: true,
          text: "Age Group",
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
        min: 0, // Set a minimum value for the Y-axis
        max: 5, // Assuming scores range between 1 and 5
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Avg Score: ${tooltipItem.raw.y}`; // Display average score on hover
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
