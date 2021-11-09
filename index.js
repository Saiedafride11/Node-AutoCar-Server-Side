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
    const database = client.db("tourX");
    const toursCollection = database.collection("tours");
    const ordersCollection = database.collection("orders");
    
    //GET API Tours
     app.get('/tours', async (req, res) => {
      const cursor = toursCollection.find({})
      const tours = await cursor.toArray();
      res.send(tours)
    })

    // POST API
    app.post("/tours", async (req, res) => {
      const tours= req.body;
      const tour = await toursCollection.insertOne(tours)
      res.json(tour)
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
      const tour = await ordersCollection.findOne(query);
      res.send(tour);
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
      const tour = await ordersCollection.deleteOne(query);
      res.json(tour);
    })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello')
  })
  
  app.listen(port, () => {
    console.log('Running Server', port)
  })