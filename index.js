const express = require("express");
const dotenv = require("dotenv");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { adminMessaging } = require("./lib/firebase-admin");

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
        // await client.connect();

        const db = client.db("assignment-9");

        const doctorsCollection = db.collection("doctors");
        const bookingsCollection = db.collection("bookings");
        const fcmTokensCollection = db.collection("fcmTokens");

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
            const email = req.query.email;

            const query = {};

            if (email) {
                query.email = email;
            }

            const result = await bookingsCollection.find(query).toArray();

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

        // BOOKINGS DELETE
        app.delete("/bookings/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const result = await bookingsCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        // push notificaton
        app.post("/api/fcm/save-token", async (req, res) => {
            try {
                const { token, email } = req.body;

                if (!token) {
                    return res.status(400).send({
                        success: false,
                        message: "Token is required",
                    });
                }

                await fcmTokensCollection.updateOne(
                    { email },
                    {
                        $set: {
                            token,
                            email,
                            updatedAt: new Date()
                        }
                    },
                    {
                        upsert: true
                    }
                );
                res.send({
                    success: true,
                    message: "Token saved successfully",
                });
            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: error.message,
                });
            }
        });


        app.post("/api/fcm/send", async (req, res) => {
            try {

                const { token, title, body, url } = req.body;


                if (!token || !title || !body) {
                    return res.status(400).json({
                        success: false,
                        message: "token, title and body are required",
                    });
                }


                const response = await adminMessaging.send({

                    token,

                    notification: {
                        title,
                        body,
                    },


                    data: {
                        title,
                        body,
                        url: url || "/",
                    },


                    webpush: {
                        fcmOptions: {
                            link: url || "/",
                        },
                    },
                });


                return res.status(200).json({
                    success: true,
                    messageId: response,
                });


            } catch (error) {

                console.error(error);


                return res.status(500).json({
                    success: false,
                    message: error.message,
                });

            }
        });

        app.get("/api/fcm/token/:email", async (req, res) => {
            try {
                const email = req.params.email;


                const result = await fcmTokensCollection.findOne({
                    email: email,
                });


                if (!result) {
                    return res.status(404).json({
                        success: false,
                        message: "Token not found",
                    });
                }


                return res.status(200).json(result);


            } catch (error) {

                console.error(error);

                return res.status(500).json({
                    success: false,
                    message: error.message,
                });
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