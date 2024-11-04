// fetchDocuments.js
const { MongoClient } = require("mongodb");

// MongoDB connection details
const username = "jensmalm"; // Your MongoDB username
const password = encodeURIComponent("Tifrastina7523"); // Replace with your actual password
const clusterUrl = "cluster0.wyofq.mongodb.net"; // Your MongoDB cluster URL
const databaseName = "questionnaire_db"; // Your database name
const collectionName = "responses"; // Your collection name

// Create the connection URI
const uri = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=Cluster0`;

async function fetchDocuments() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Fetch documents and transform them
    const documents = await collection.find({}).limit(5).toArray();

    // Create a compressed version
    const compressedDocuments = documents.map((doc) => ({
      userId: doc.userId,
      user: {
        ageGroup: doc.age, // Adjust according to your actual age group logic
      },
      documents: doc.documents.map((document) => ({
        documentId: document.documentId,
        answers: document.answers.map((answer) => ({
          rating: answer.rating, // Only include the rating in the answers
        })),
      })),
    }));

    console.log(
      "Compressed Sample Documents:",
      JSON.stringify(compressedDocuments, null, 2)
    ); // Log with indentation
  } catch (error) {
    console.error("Error fetching documents:", error);
  } finally {
    await client.close();
  }
}

fetchDocuments();
