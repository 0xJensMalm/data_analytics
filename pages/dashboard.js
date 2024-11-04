import { useState, useEffect } from "react";
import ScoreComparison from "../components/ScoreComparison";
import DocumentSpreadChart from "../components/DocumentSpreadChart";
import ScoreComparisonScatter from "../components/ScoreComparisonScatter";
import DemographicsAnalysis from "../components/DemographicsAnalysis";
import RatingComparisonChart from "../components/RatingComparisonChart";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("layman");
  const [statistics, setStatistics] = useState({
    layman: {
      totalParticipants: 0,
      totalDocumentsRated: 0,
      totalQuestionsAnswered: 0,
    },
    expert: {
      totalParticipants: 0,
      totalDocumentsRated: 0,
      totalQuestionsAnswered: 0,
    },
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/getData");
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  // In pages/dashboard.js
  return (
    <div style={{ padding: "20px", backgroundColor: "#f8f9fa" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Statistics Dashboard
      </h1>

      {/* Top Section: General Info and Document Spread */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left Side: General Info - 30% width */}
        <div style={{ width: "30%", padding: "10px" }}>
          <h2>General Info</h2>
          <div style={{ marginBottom: "20px" }}>
            <h3>Laymen</h3>
            <p>Total Participants: {statistics.layman.totalParticipants}</p>
            <p>
              Total Documents Rated: {statistics.layman.totalDocumentsRated}
            </p>
            <p>
              Total Questions Answered:{" "}
              {statistics.layman.totalQuestionsAnswered}
            </p>
          </div>
          <div>
            <h3>Experts</h3>
            <p>Total Participants: {statistics.expert.totalParticipants}</p>
            <p>
              Total Documents Rated: {statistics.expert.totalDocumentsRated}
            </p>
            <p>
              Total Questions Answered:{" "}
              {statistics.expert.totalQuestionsAnswered}
            </p>
          </div>
        </div>

        {/* Right Side: Document Spread Chart - 70% width */}
        <div style={{ width: "70%", padding: "10px" }}>
          <DocumentSpreadChart />
        </div>
      </div>

      {/* Score Comparison Section */}
      <div style={{ marginTop: "20px" }}>
        {activeTab === "layman" && (
          <div style={{ height: "60%" }}>
            <ScoreComparison />
          </div>
        )}
      </div>

      {/* Demographics Section */}
      <div style={{ marginTop: "40px" }}>
        <h2>Participant Demographics</h2>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div style={{ flex: 1 }}>
            <DemographicsAnalysis />
          </div>
        </div>
      </div>

      {/* Expert vs Laymen comparison */}
      <div style={{ marginTop: "40px" }}>
        <h2>Ekspert vs lekfolk sammenligning</h2>
        <RatingComparisonChart />
      </div>

      {/* Age Group Analysis Section */}
      <div style={{ marginTop: "40px" }}>
        <h2>Score Analysis by Age</h2>
        <ScoreComparisonScatter />
      </div>
    </div>
  );
};

export default Dashboard;
