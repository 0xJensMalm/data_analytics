import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ScoreComparison = () => {
  const [data, setData] = useState({ laymanScores: [] });

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch("/api/averageScores");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    fetchScores();
  }, []);

  const prepareChartData = (scores) => {
    const originalScores = scores.filter((score) => !score.isTranslated);
    const translatedScores = scores.filter((score) => score.isTranslated);

    return {
      labels: originalScores.map((score) => score.documentId),
      datasets: [
        {
          label: "Original Scores",
          data: originalScores.map((score) => score.avgScore),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
        {
          label: "Translated Scores",
          data: translatedScores.map((score) => score.avgScore),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
        },
      ],
    };
  };

  const laymanChartData = prepareChartData(data.laymanScores);

  return (
    <div>
      <h2>Layman Score Comparison</h2>
      {/* Set the height of the chart to 60% of the original */}
      <div style={{ height: "300px" }}>
        <Bar data={laymanChartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default ScoreComparison;
