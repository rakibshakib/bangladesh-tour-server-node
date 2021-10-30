const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

// mongoDBSetting 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tygmv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const bangladeshTour = client.db("Bangladesh_Tour");
        const packages = bangladeshTour.collection("packages");
        const booking = bangladeshTour.collection("booking_data")

        // GET API 
        app.get("/packages", async (req, res) => {
            const cursor = packages.find({})
            const allPackages = await cursor.toArray();
            res.send(allPackages)
        })

        // create package by admin, POST Method
        app.post('/packages', async (req, res) => {
            const newPackages = req.body;
            const result = await packages.insertOne(newPackages)
            res.json(result)
        })
        // get data by single id || findOne operation
        app.get("/packages/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await packages.findOne(query);
            res.send(package)
        })

        // this data come form user form 
        // post data for booking tour package      
        app.post('/booking', async (req, res) => {
            const order = req.body;
            const result = await booking.insertOne(order);
            res.json(result)
        })

        // get user data by the email

        app.post("/my-booking", async (req, res) => {
            try {
                const email = req.body.email;
                const cursor = booking.find({ email: email });
                const myBookings = await cursor.toArray();

                res.status(200).json(myBookings)
            } catch (error) {
                res.status(404).json({
                    message: error.message
                })
            }
        })

        // get all booking data 
        app.get('/booking-data', async (req, res) => {
            const cursor = booking.find({})
            const allBooking = await cursor.toArray();
            res.send(allBooking)
        })

        // delete one package by user || Delete method 
        app.delete('/booking-data/:id', async (req, res) => {
            const id = req.params.id;
            console.log("delete this id", id);
            const query = { _id: ObjectId(id) };
            const result = await booking.deleteOne(query)
            res.json(result)
        })

        app.patch('/update-booking', async (req, res) => {
            const { _id } = req.body;

            const updateBooking = await booking.findOneAndUpdate({ _id: ObjectId(_id) }, { $set: { status: "Approved" } },  {returnOriginal: false});

            res.status(200).json(updateBooking)

        })

        // add new service form ui ||  POST API 
        // app.post("/packages", async(req, res)=>{
        //     const data = req.body;
        //     const result = await packages.insertOne(data)
        //     res.json(result)
        // }) 

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Welcome to Bangladesh Tour Server - 2021 🤗 \n What are you serching ?🤔 \n Do You Know Path Name ? 🥴")
});

app.listen(port, () => {
    console.log("Nodemon is running for Bangladesh Tour by RS....🥱", port);
})