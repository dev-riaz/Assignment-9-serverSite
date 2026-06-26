const express = require("express");
const dotenv = require("dotenv");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

// middleware
app.use(cors());
app.use(express.json());

// Mongo client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("assignment-9");

    // collections
    const doctorsCollection = db.collection("doctors");
    const bookingsCollection = db.collection("bookings");

   
    app.get("/allData", async (req, res) => {
      try {
        const result = await doctorsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    
    app.get("/allData/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await doctorsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    
    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;

        const result = await bookingsCollection.insertOne(booking);

        res.send({
          success: true,
          message: "Booking saved successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

   
   

    console.log("MongoDB connected successfully 🚀");
  } finally {
   
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Doctor Appointment API Running...");
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});