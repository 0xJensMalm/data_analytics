import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Average scores for laymen
    const laymanScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^l" } } },
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: {
              documentId: "$documents.documentId",
              isTranslated: "$documents.isTranslated",
            },
            avgScore: { $avg: "$documents.answers.rating" },
          },
        },
        {
          $project: {
            _id: 0,
            documentId: "$_id.documentId",
            isTranslated: "$_id.isTranslated",
            avgScore: 1,
          },
        },
      ])
      .toArray();

    // Average scores for experts
    const expertScores = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^e" } } },
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: {
              documentId: "$documents.documentId",
              isTranslated: "$documents.isTranslated",
            },
            avgScore: { $avg: "$documents.answers.rating" },
          },
        },
        {
          $project: {
            _id: 0,
            documentId: "$_id.documentId",
            isTranslated: "$_id.isTranslated",
            avgScore: 1,
          },
        },
      ])
      .toArray();

    res.status(200).json({ laymanScores, expertScores });
  } catch (error) {
    console.error("Error fetching average scores:", error);
    res.status(500).json({ message: "Error fetching average scores" });
  }
}
