import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("connect successfully to MongoDb");
    dbConnection = client.db();
  } catch (error) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

function getDb() {
  if (!dbConnection) {
    throw new Error("Database not connected");
  }
  return dbConnection;
}

export { connectToDatabase, getDb };
