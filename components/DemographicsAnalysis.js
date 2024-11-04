import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DemographicsAnalysis = () => {
  const [data, setData] = React.useState({
    genderDistribution: { labels: [], data: [] },
    ageDistribution: { labels: [], data: [] },
  });

  React.useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const response = await fetch("/api/demographics");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching demographics:", error);
      }
    };

    fetchDemographics();
  }, []);

  const calculatePercentages = (data) => {
    const total = data.reduce((acc, curr) => acc + curr, 0);
    return data.map((value) => ((value / total) * 100).toFixed(1));
  };

  const genderPercentages = calculatePercentages(data.genderDistribution.data);
  const agePercentages = calculatePercentages(data.ageDistribution.data);

  const genderData = {
    labels: data.genderDistribution.labels,
    datasets: [
      {
        data: data.genderDistribution.data,
        backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const ageData = {
    labels: data.ageDistribution.labels,
    datasets: [
      {
        data: data.ageDistribution.data,
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "1.1rem",
          }}
        >
          Gender Distribution
        </h3>
        <div style={{ height: "180px", marginBottom: "10px" }}>
          <Pie data={genderData} options={options} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginTop: "5px",
          }}
        >
          {data.genderDistribution.labels.map((label, index) => (
            <div
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  marginRight: "6px",
                  backgroundColor:
                    genderData.datasets[0].backgroundColor[index],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.9rem" }}>
                {label}: {genderPercentages[index]}% (
                {data.genderDistribution.data[index]})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "1.1rem",
          }}
        >
          Distrbusjon av alder
        </h3>
        <div style={{ height: "180px", marginBottom: "10px" }}>
          <Pie data={ageData} options={options} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "8px",
            marginTop: "5px",
          }}
        >
          {data.ageDistribution.labels.map((label, index) => (
            <div
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  marginRight: "6px",
                  backgroundColor: ageData.datasets[0].backgroundColor[index],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.9rem" }}>
                {label}: {agePercentages[index]}% (
                {data.ageDistribution.data[index]})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemographicsAnalysis;
