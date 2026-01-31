import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

const globalForMongo = globalThis as unknown as { _mongoClient: MongoClient };
const client =
  globalForMongo._mongoClient ?? new MongoClient(process.env.MONGODB_URI);
globalForMongo._mongoClient = client;

const db = client.db("bs-detector");
export const reportsCollection = db.collection("reports");
export { client };
