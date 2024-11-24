import express from "express";
import cors from "cors";
import { connectToDatabase, getDb } from "./db/index.js";
import "dotenv/config";
import { ObjectId } from "mongodb";
import { error } from "console";

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port http://127.0.0.1:${port}`);
    });
  })
  .catch((err) => {
    console.error(
      "Failed to start the server due to MongoDb connection issue",
      err
    );
  });

app.post("/products", async (req, res) => {
  try {
    const db = getDb();
    const product = req.body;
    if (!product.name || !product.price || !product.description) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const result = await db.collection("products").insertOne(product);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const db = getDb();
    const results = await db.collection("products").find().toArray();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const db = getDb();
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product Id" });
    }
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to featch product" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const db = getDb();
    const updateData = req.body;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product Id" });
    }
    const result = await db.collection("products").updateOne(
      {
        _id: new ObjectId(productId),
      },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "Product update successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const db = getDb();
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(productId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});
