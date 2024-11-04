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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DocumentSpreadChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });
  const [totalDocuments, setTotalDocuments] = useState(0); // New state for total documents

  useEffect(() => {
    const fetchDocumentSpread = async () => {
      try {
        const response = await fetch("/api/documentSpread");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Fetched Document Spread:", result);

        // Filter out any "Unknown" documents
        const filteredResult = result.documentSpread.filter(
          (doc) => doc.documentId !== "Unknown"
        );

        // Sort the filtered data alphabetically by documentId
        const sortedResult = filteredResult.sort((a, b) => {
          const docA = a.documentId || ""; // Provide fallback empty string for null/undefined
          const docB = b.documentId || "";
          return docA.localeCompare(docB);
        });

        // Set the sorted data to state
        setData({
          labels: sortedResult.map((doc) => doc.documentId),
          counts: sortedResult.map((doc) => doc.count),
        });
        setTotalDocuments(result.totalDocuments); // Set total documents from API response
      } catch (error) {
        console.error("Error fetching document spread:", error);
      }
    };

    fetchDocumentSpread();
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Document Ratings Count",
        data: data.counts,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div>
      <h2>Dokument spredning</h2>
      <p>Totalt antall dokumenter: {totalDocuments}</p>{" "}
      {/* Display total documents */}
      <div style={{ height: "200px" }}>
        {data.labels.length > 0 ? (
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        ) : (
          <p>No document data available to display.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentSpreadChart;
