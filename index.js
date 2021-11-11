const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9lnx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();
    const database = client.db("autoCar");
    const carsCollection = database.collection("cars");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    
    //GET API cars
     app.get('/cars', async (req, res) => {
      const cursor = carsCollection.find({})
      const cars = await cursor.toArray();
      res.send(cars)
    })

    // POST API
    app.post("/cars", async (req, res) => {
      const cars = req.body;
      const car = await carsCollection.insertOne(cars)
      res.json(car)
    })


     // GET API Cars Id
     app.get('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const car = await carsCollection.findOne(query);
      res.send(car);
    })

    // Delete API Cars Id
    app.delete('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const car = await carsCollection.deleteOne(query);
      res.json(car);
    })
    // ---------------------------------------------------------
    // ------------------- reviewsCollection  -----------------------------
    // ---------------------------------------------------------
      //GET API cars
      app.get('/review', async (req, res) => {
        const cursor = reviewsCollection.find({})
        const review = await cursor.toArray();
        res.send(review)
      })
  
      // POST API
      app.post("/review", async (req, res) => {
        const reviews = req.body;
        const review = await reviewsCollection.insertOne(reviews)
        res.json(review)
      })

    // ---------------------------------------------------------
    // ------------------- ordersCollection  -----------------------------
    // ---------------------------------------------------------

    // POST API Orders
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order)
      res.json(result)
  })

    //GET API Orders
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({})
      const orders = await cursor.toArray()
      res.send(orders)
    })

    // GET API Orders Id
    app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const order = await ordersCollection.findOne(query);
      res.send(order);
    })

    // Update Status Orders
    app.put('/orders/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id)};
          const status = req.body.status;
          const options = { upsert: true };
          const updateDoc = {
          $set: {
            status: status
          },
        };
        const result = await ordersCollection.updateOne(query, updateDoc, options);
        res.json(result);
    })

    // Delete API Orders Id
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const order = await ordersCollection.deleteOne(query);
      res.json(order);
    })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Auto Car')
  })
  
  app.listen(port, () => {
    console.log('Running Server Auto Car', port)
  })