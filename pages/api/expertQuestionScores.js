// pages/api/expertQuestionScores.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Get the overall averages for the chart first
    const overallScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^e" } } },
        { $unwind: "$documents" },
        {
          $unwind: {
            path: "$documents.answers",
            includeArrayIndex: "answerIndex",
          },
        },
        {
          $group: {
            _id: "$answerIndex",
            avgScore: { $avg: "$documents.answers.rating" },
          },
        },
        {
          $project: {
            _id: 0,
            questionIndex: "$_id",
            avgScore: { $round: ["$avgScore", 2] },
          },
        },
        { $sort: { questionIndex: 1 } },
      ])
      .toArray();

    // Get individual low scores
    const lowScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^e" } } },
        { $unwind: "$documents" },
        {
          $unwind: {
            path: "$documents.answers",
            includeArrayIndex: "answerIndex",
          },
        },
        {
          $match: {
            "documents.answers.rating": { $lte: 3 },
          },
        },
        {
          $project: {
            _id: 0,
            userId: 1,
            documentId: {
              $ifNull: [
                "$documents.originalDocumentId",
                "$documents.documentId",
              ],
            },
            questionIndex: "$answerIndex",
            rating: "$documents.answers.rating",
            comment: {
              $ifNull: ["$documents.answers.comment", ""],
            },
          },
        },
        { $sort: { rating: 1 } },
        { $limit: 10 }, // Limit to top 10 lowest scores
      ])
      .toArray();

    console.log("API Response:", { overallScores, lowScores }); // Debug log

    res.status(200).json({
      overallScores,
      lowScores,
    });
  } catch (error) {
    console.error("Error fetching expert question scores:", error);
    res.status(500).json({ message: "Error fetching expert question scores" });
  }
}
