// /pages/api/compareScores.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Layperson average scores
    const laymanScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^l" } } },
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: "$documents.documentId",
            avgScore: { $avg: "$documents.answers.rating" },
          },
        },
        {
          $project: {
            _id: 0,
            documentId: "$_id",
            avgLaymanScore: "$avgScore",
          },
        },
      ])
      .toArray();

    // Expert average scores
    const expertScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^e" } } },
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: "$documents.documentId",
            avgScore: { $avg: "$documents.answers.rating" },
          },
        },
        {
          $project: {
            _id: 0,
            documentId: "$_id",
            avgExpertScore: "$avgScore",
          },
        },
      ])
      .toArray();

    // Merging layman and expert scores
    const combinedScores = laymanScores.map((layman) => {
      const expert = expertScores.find(
        (e) => e.documentId === layman.documentId
      );
      return {
        documentId: layman.documentId,
        avgLaymanScore: layman.avgLaymanScore,
        avgExpertScore: expert ? expert.avgExpertScore : null,
      };
    });

    res.status(200).json(combinedScores);
  } catch (error) {
    console.error("Error fetching comparison scores:", error);
    res.status(500).json({ message: "Error fetching comparison scores" });
  }
}
