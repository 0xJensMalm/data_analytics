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

const expertQuestions = [
  "Informasjonen i dokumentet er medisinsk korrekt. ",
  "Dokumentet inneholder all relevant medisinsk informasjon uten utelatelser. ",
  "De kliniske tiltakene og planene fremover for pasienten er klart presentert. ",
  "Språket er klart og tydelig, fri for unødvendig kompleksitet. ",
  "Dokumentet har en logisk og lett forståelig struktur. ",
  "Oppsummeringene av medisinsk informasjon er nøyaktige og klare.",
  "Dokumentet er formidlet på en måte som vil være forståelig for pasienter. ",
  "Oversettelsen har høyere nytteverdi for pasienten enn originalen.",
  "Jeg kunne tatt i bruk denne typen oversettelse i min pasientbehandling ",
  "Oversettelsen kan bidra til bedre kommunikasjon og forståelse mellom leger og pasient. ",
];

const ExpertQuestionAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/expertQuestionScores");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        console.log("Fetched expert question data:", result); // Debug log
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    console.log("Loading state"); // Debug log
    return <div>Loading expert question analysis...</div>;
  }
  if (error) {
    console.log("Error state:", error); // Debug log
    return <div>Error: {error}</div>;
  }
  if (!data || !data.overallScores || !data.lowScores) {
    console.log("No data state. Current data:", data); // Debug log
    return <div>No data available</div>;
  }

  console.log("Preparing chart data with:", data.overallScores); // Debug log

  const averageScoresChartData = {
    labels: data.overallScores.map((score) => `Q${score.questionIndex + 1}`),
    datasets: [
      {
        label: "Average Score",
        data: data.overallScores.map((score) => score.avgScore),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  console.log("Chart data prepared:", averageScoresChartData); // Debug log

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          afterLabel: function (context) {
            const questionIndex = context.dataIndex;
            return ["Question:", expertQuestions[questionIndex]];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: "Average Score",
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", marginBottom: "40px" }}>
      {" "}
      {/* Added width and margin */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          padding: "20px",
        }}
      >
        {/* Left component - Average Scores Chart */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
            Average Expert Scores by Question
          </h3>
          <div style={{ height: "400px", position: "relative" }}>
            {" "}
            {/* Added position relative */}
            <Bar data={averageScoresChartData} options={chartOptions} />
          </div>
        </div>

        {/* Right component - Individual Low Scores */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            height: "460px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
            Low Individual Scores
          </h3>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {data.lowScores.length > 0 ? (
              data.lowScores.map((score, index) => (
                <div
                  key={index}
                  style={{
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderLeft: "4px solid",
                    borderLeftColor: score.rating <= 2 ? "#dc3545" : "#ffc107",
                    borderRadius: "4px",
                    marginBottom: "15px",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontWeight: "bold" }}>
                      Document {score.documentId}
                    </span>
                    <span style={{ color: "#666", marginLeft: "10px" }}>
                      (Expert {score.userId})
                    </span>
                  </div>
                  <p>
                    <strong>Q{score.questionIndex + 1}:</strong>{" "}
                    {expertQuestions[score.questionIndex]}
                  </p>
                  <p>Score: {score.rating}</p>
                  {score.comment && <p>Comment: {score.comment}</p>}
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#666" }}>
                No low scores found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertQuestionAnalysis;
