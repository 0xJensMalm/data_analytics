// pages/api/expertLaymanComparison.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Get expert ratings
    const expertRatings = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^e" } } },
        { $unwind: "$documents" },
        {
          $project: {
            originalDocumentId: "$documents.originalDocumentId",
            translatedDocumentId: "$documents.translatedDocumentId",
            answers: "$documents.answers",
          },
        },
        { $unwind: "$answers" },
        {
          $group: {
            _id: {
              originalId: "$originalDocumentId",
              translatedId: "$translatedDocumentId",
            },
            expertScore: { $avg: "$answers.rating" },
            expertCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            originalDocumentId: "$_id.originalId",
            translatedDocumentId: "$_id.translatedId",
            expertScore: 1,
            expertCount: 1,
          },
        },
      ])
      .toArray();

    console.log("Expert Ratings:", expertRatings);

    // Get all document IDs (both original and translated)
    const documentIds = expertRatings.reduce((ids, rating) => {
      if (rating.originalDocumentId) ids.push(rating.originalDocumentId);
      if (rating.translatedDocumentId) ids.push(rating.translatedDocumentId);
      return ids;
    }, []);

    // Get layman ratings for translated documents
    const laymanRatings = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^l" } } },
        { $unwind: "$documents" },
        {
          $match: {
            "documents.documentId": { $in: documentIds },
          },
        },
        { $unwind: "$documents.answers" },
        {
          $group: {
            _id: "$documents.documentId",
            laymanScore: { $avg: "$documents.answers.rating" },
            laymanCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            documentId: "$_id",
            laymanScore: 1,
            laymanCount: 1,
          },
        },
      ])
      .toArray();

    console.log("Layman Ratings:", laymanRatings);

    // Combine the ratings
    const combinedRatings = expertRatings
      .map((expert) => {
        const translatedLayman = laymanRatings.find(
          (l) => l.documentId === expert.translatedDocumentId
        );

        return {
          documentPair: `${expert.originalDocumentId} / ${expert.translatedDocumentId}`,
          expertScore: parseFloat(expert.expertScore.toFixed(2)),
          laymanScore: translatedLayman
            ? parseFloat(translatedLayman.laymanScore.toFixed(2))
            : null,
          expertCount: expert.expertCount,
          laymanCount: translatedLayman ? translatedLayman.laymanCount : 0,
        };
      })
      .filter((rating) => rating.expertScore != null);

    console.log("Combined Ratings:", combinedRatings);

    res.status(200).json(combinedRatings);
  } catch (error) {
    console.error("Error fetching comparison data:", error);
    res.status(500).json({ message: "Error fetching comparison data" });
  }
}
