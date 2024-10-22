import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    const documentSpread = await db
      .collection("responses")
      .aggregate([
        { $unwind: "$documents" },
        {
          $group: {
            _id: "$documents.documentId",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            documentId: "$_id",
            count: 1,
          },
        },
      ])
      .toArray();

    console.log("Document Spread Data:", documentSpread); // Log to check data

    res.status(200).json(documentSpread);
  } catch (error) {
    console.error("Error fetching document spread:", error);
    res.status(500).json({ message: "Error fetching document spread" });
  }
}
