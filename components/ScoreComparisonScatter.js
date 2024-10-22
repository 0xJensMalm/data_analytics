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

// Register Chart.js components including PointElement
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
        const response = await fetch("/api/compareScores");
        const result = await response.json();

        // Log the result to check if data is coming in
        console.log("Fetched Score Comparison Data:", result);

        setData(result);
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

  const scatterData = {
    datasets: [
      {
        label: "Layperson vs. Expert Scores",
        data: data.map((doc) => ({
          x: doc.avgExpertScore || 0, // Provide fallback if no expert score
          y: doc.avgLaymanScore || 0, // Provide fallback if no layman score
        })),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Expert Score (Accuracy)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Layperson Score (Understandability)",
        },
      },
    },
  };

  return (
    <div style={{ height: "400px", overflow: "hidden" }}>
      {" "}
      {/* Limit vertical expansion */}
      <h2>Layperson vs. Expert Score Comparison</h2>
      <Scatter data={scatterData} options={options} />
    </div>
  );
};

export default ScoreComparisonScatter;
