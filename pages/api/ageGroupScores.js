// /pages/api/ageGroupScores.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Group layperson scores by age group
    const ageGroupScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^l" } } }, // Only include layman responses
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: "$age", // Group by age directly
            avgScore: { $avg: "$documents.answers.rating" }, // Calculate average score
          },
        },
        {
          $project: {
            _id: 0,
            ageGroup: "$_id", // Return age group
            avgScore: "$avgScore", // Include average score in output
          },
        },
      ])
      .toArray();

    console.log("Age Group Scores:", ageGroupScores); // Log the grouped results

    res.status(200).json(ageGroupScores); // Send response
  } catch (error) {
    console.error("Error fetching age group scores:", error);
    res.status(500).json({ message: "Error fetching age group scores" }); // Error handling
  }
}
