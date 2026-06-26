const express = require("express");
const dotenv = require("dotenv");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

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

        const doctorsCollection = db.collection("doctors");
        const bookingsCollection = db.collection("bookings");

        // DOCTORS
        
        app.get("/allData", async (req, res) => {
            const result = await doctorsCollection.find().toArray();
            res.send(result);
        });

        app.get("/allData/:id", async (req, res) => {
            const id = req.params.id;
            const result = await doctorsCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send(result);
        });

       
        // BOOKINGS CREATE
       
        app.post("/bookings", async (req, res) => {
            const result = await bookingsCollection.insertOne(req.body);
            res.send(result);
        });

       
        // BOOKINGS GET
      
        app.get("/bookings", async (req, res) => {
            const result = await bookingsCollection.find().toArray();
            res.send(result);
        });

      
        // BOOKINGS UPDATE (FIXED)
       
        app.put("/bookings/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const result = await bookingsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            symptoms: req.body.symptoms,
                            appointmentDate: req.body.appointmentDate,
                        },
                    }
                );

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        console.log("MongoDB connected 🚀");
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