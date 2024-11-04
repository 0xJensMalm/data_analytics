// pages/api/demographics.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Get gender distribution using the sex field
    const genderDistribution = await db
      .collection("responses")
      .aggregate([
        {
          $group: {
            _id: { $toUpper: "$gender" }, // Uppercase for consistency
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 }, // Sort alphabetically
        },
      ])
      .toArray();

    // Get age distribution with ranges (keeping the working query)
    const ageDistribution = await db
      .collection("responses")
      .aggregate([
        {
          $addFields: {
            ageRange: {
              $switch: {
                branches: [
                  { case: { $lte: ["$age", 25] }, then: "15-25" },
                  { case: { $lte: ["$age", 40] }, then: "26-40" },
                  { case: { $lte: ["$age", 60] }, then: "41-60" },
                  { case: { $lte: ["$age", 75] }, then: "61-75" },
                ],
                default: "75+",
              },
            },
          },
        },
        {
          $group: {
            _id: "$ageRange",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .toArray();

    // Log the results for debugging
    console.log("Gender Distribution:", genderDistribution);
    console.log("Age Distribution:", ageDistribution);

    res.status(200).json({
      genderDistribution: {
        labels: genderDistribution.map((item) => item._id),
        data: genderDistribution.map((item) => item.count),
      },
      ageDistribution: {
        labels: ageDistribution.map((item) => item._id),
        data: ageDistribution.map((item) => item.count),
      },
    });
  } catch (error) {
    console.error("Error fetching demographics:", error);
    res.status(500).json({ message: "Error fetching demographics data" });
  }
}
