import { Bar } from "react-chartjs-2";
import { useState, useEffect } from "react";

const AgeGroupBarChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAgeGroupScores = async () => {
      try {
        const response = await fetch("/api/ageGroupScores");
        const result = await response.json();

        // Log the result to check if data is coming in
        console.log("Fetched Age Group Data:", result);

        setData(result);
      } catch (error) {
        console.error("Error fetching age group scores:", error);
      }
    };

    fetchAgeGroupScores();
  }, []);

  // Prevent rendering the chart if there's no data
  if (!data.length) {
    return <p>No data available for age group analysis.</p>;
  }

  const chartData = {
    labels: data.map((group) => group.ageGroup || "Unknown"), // Fallback to 'Unknown' for missing age group
    datasets: [
      {
        label: "Average Understandability Score",
        data: data.map((group) => group.avgScore || 0), // Fallback to 0 if no score
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  return (
    <div style={{ height: "400px", overflow: "hidden" }}>
      {" "}
      {/* Limit vertical expansion */}
      <h2>Understandability by Age Group</h2>
      <Bar data={chartData} options={{ maintainAspectRatio: false }} />
    </div>
  );
};

export default AgeGroupBarChart;
