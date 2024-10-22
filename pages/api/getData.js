import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("questionnaire_db");

    // Fetch total layman participants
    const totalLaymanParticipants = await db
      .collection("responses")
      .countDocuments({ userId: { $regex: "^l" } });
    console.log("Total Layman Participants:", totalLaymanParticipants);

    // Fetch total expert participants
    const totalExpertParticipants = await db
      .collection("responses")
      .countDocuments({ userId: { $regex: "^e" } });
    console.log("Total Expert Participants:", totalExpertParticipants);

    // Fetch total documents rated by laymen
    const totalLaymanDocumentsRated = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^l" } } },
        { $unwind: "$documents" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .toArray();
    const laymanDocumentsRatedCount =
      totalLaymanDocumentsRated.length > 0
        ? totalLaymanDocumentsRated[0].count
        : 0;
    console.log("Total Documents Rated by Laymen:", laymanDocumentsRatedCount);

    // Fetch total documents rated by experts
    const totalExpertDocumentsRated = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^e" } } },
        { $unwind: "$documents" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .toArray();
    const expertDocumentsRatedCount =
      totalExpertDocumentsRated.length > 0
        ? totalExpertDocumentsRated[0].count
        : 0;
    console.log("Total Documents Rated by Experts:", expertDocumentsRatedCount);

    // Fetch total questions answered by laymen
    const totalLaymanQuestionsAnswered = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^l" } } },
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .toArray();
    const laymanQuestionsAnsweredCount =
      totalLaymanQuestionsAnswered.length > 0
        ? totalLaymanQuestionsAnswered[0].count
        : 0;
    console.log(
      "Total Questions Answered by Laymen:",
      laymanQuestionsAnsweredCount
    );

    // Fetch total questions answered by experts
    const totalExpertQuestionsAnswered = await db
      .collection("responses")
      .aggregate([
        { $match: { userId: { $regex: "^e" } } },
        { $unwind: "$documents" },
        { $unwind: "$documents.answers" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .toArray();
    const expertQuestionsAnsweredCount =
      totalExpertQuestionsAnswered.length > 0
        ? totalExpertQuestionsAnswered[0].count
        : 0;
    console.log(
      "Total Questions Answered by Experts:",
      expertQuestionsAnsweredCount
    );

    res.status(200).json({
      layman: {
        totalParticipants: totalLaymanParticipants,
        totalDocumentsRated: laymanDocumentsRatedCount,
        totalQuestionsAnswered: laymanQuestionsAnsweredCount,
      },
      expert: {
        totalParticipants: totalExpertParticipants,
        totalDocumentsRated: expertDocumentsRatedCount,
        totalQuestionsAnswered: expertQuestionsAnsweredCount,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
}
