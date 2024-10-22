import Link from "next/link";

const Home = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to the Analytics Dashboard</h1>
      <Link href="/dashboard">
        <span
          style={{
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Go to Dashboard
        </span>
      </Link>
    </div>
  );
};

export default Home;
