const express = require('express');
const dotenv = require('dotenv')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI

const cors = require('cors')
const app = express();
app.use(cors())

const port = process.env.PORT || 5000;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();
        const db = client.db('assignment-9')
        const doctorsCollection = db.collection("doctors")

        app.get("/allData", async (req, res) => {
            const cursor = doctorsCollection.find()
            const result = await cursor.toArray()
            res.send(result)

        })

        app.get("/allData/:id", async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await doctorsCollection.findOne(query)
            res.send(result)

        })

    } finally {

        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});