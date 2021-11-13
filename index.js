const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9lnx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];

      try {
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch {

      }

  }
  next();
}


async function run() {
  try {
    await client.connect();
    const database = client.db("autoCar");
    const carsCollection = database.collection("cars");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection('users');
    const messageCollection = database.collection('messages');
    
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
    // ------------------- ordersCollection  -------------------
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
          $set: { status: status},
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

    // ---------------------------------------------------------
    // ------------------- reviewsCollection  -------------------
    // ----------------------------------------------------------

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
    // ------------------- usersCollection  -------------------
    // ----------------------------------------------------------

    //Post API Users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //Update API Users
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Update API Users Admin
    app.put('/users/admin', verifyToken, async (req, res) => {
      const user = req.body;
      const requester = req.decodedEmail;
      if (requester) {
          const requesterAccount = await usersCollection.findOne({ email: requester });
          if (requesterAccount.role === 'admin') {
              const filter = { email: user.email };
              const updateDoc = { $set: { role: 'admin' } };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.json(result);
          }
      }
      else {
          res.status(403).json({ message: 'You do not have access to make admin' })
      }

    })

    //GET API Users
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    // ---------------------------------------------------------
    // ------------------- messageCollection  -------------------
    // ----------------------------------------------------------

    //GET API messages
    app.get('/message', async (req, res) => {
      const cursor = messageCollection.find({})
      const message = await cursor.toArray();
      res.send(message)
    })

    // POST API messages
    app.post("/message", async (req, res) => {
      const messages = req.body;
      const message = await messageCollection.insertOne(messages)
      res.json(message)
    })

     // GET API messages Id
     app.get('/message/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const message = await messageCollection.findOne(query);
      res.send(message);
    })

    // Delete API messages Id
    app.delete('/message/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const message = await messageCollection.deleteOne(query);
      res.json(message);
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