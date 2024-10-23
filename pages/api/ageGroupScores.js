// /pages/api/ageGroupScores.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Group layperson scores by age group and document type
    const ageGroupScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^l" } } }, // Only include layman responses
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: {
              age: "$age", // Group by age
              isTranslated: "$documents.isTranslated", // Group by translation status
            },
            avgScore: { $avg: "$documents.answers.rating" }, // Calculate average score
          },
        },
        {
          $project: {
            _id: 0,
            age: "$_id.age", // Return age group
            isTranslated: "$_id.isTranslated", // Include translation status
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
