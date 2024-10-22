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
        { $match: { userId: { $regex: "^l" } } },
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: "$user.ageGroup", // Assuming ageGroup is available in user document
            avgScore: { $avg: "$documents.answers.rating" },
          },
        },
        {
          $project: {
            _id: 0,
            ageGroup: "$_id",
            avgScore: "$avgScore",
          },
        },
      ])
      .toArray();

    res.status(200).json(ageGroupScores);
  } catch (error) {
    console.error("Error fetching age group scores:", error);
    res.status(500).json({ message: "Error fetching age group scores" });
  }
}
