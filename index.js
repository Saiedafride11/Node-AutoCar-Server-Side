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