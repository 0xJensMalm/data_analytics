import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RatingComparisonChart = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/expertLaymanComparison");
        const data = await response.json();

        console.log("Fetched data:", data);

        if (data.length === 0) {
          setError("No expert ratings found");
          setIsLoading(false);
          return;
        }

        const chartData = {
          labels: data.map((item) => item.documentPair),
          datasets: [
            {
              label: "Expert Rating",
              data: data.map((item) => item.expertScore),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Layman Rating (Translated)",
              data: data.map((item) => item.laymanScore),
              backgroundColor: "rgba(153, 102, 255, 0.6)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        };

        console.log("Chart data:", chartData);
        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        setError("Error loading data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: "Rating Score",
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Expert vs Layman Ratings Comparison",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            if (value === null) {
              return `${context.dataset.label}: No rating`;
            }
            return `${context.dataset.label}: ${value.toFixed(2)}`;
          },
          afterBody: function (tooltipItems) {
            const dataIndex = tooltipItems[0].dataIndex;
            const originalData = tooltipItems[0].dataset.data[dataIndex];
            return [`Number of ratings: ${originalData?.count || "N/A"}`];
          },
        },
      },
    },
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "15px",
        marginBottom: "20px",
      }}
    >
      <div style={{ height: "400px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RatingComparisonChart;
