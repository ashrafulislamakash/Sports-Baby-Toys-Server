const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-o9yzcgk-shard-00-00.ymwhs5q.mongodb.net:27017,ac-o9yzcgk-shard-00-01.ymwhs5q.mongodb.net:27017,ac-o9yzcgk-shard-00-02.ymwhs5q.mongodb.net:27017/?ssl=true&replicaSet=atlas-xges0x-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //await client.connect();

    const toyCollection = client.db("babytoys").collection("toys");

    app.get("/addtoy", async (req, res) => {
      const curser = toyCollection.find().limit(20);
      const result = await curser.toArray();
      res.send(result);
    });

    app.post("/addtoy", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await toyCollection.insertOne(newToys);
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/mytoys", async (req, res) => {
      let query = {};
      let sort = {};

      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      if (req.query?.sort === 1) {
        sort = { price: req.query.sort };
      }
      if (parseInt(req.query?.sort) === -1) {
        sort = { price: -req.query.sort };
        console.log(req.query.sort);
      }

      const result = await toyCollection.find(query).sort(sort).toArray();
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;

      let toy = {
        $set: {
          price: updatedToy.newPrice,
          availableQuantity: updatedToy.newAvailableQuantity,
          description: updatedToy.newDescription,
        },
      };
      const result = await toyCollection.updateMany(filter, toy, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (reg, res) => {
  res.send("animal toy server is running");
});

app.listen(port, () => {
  console.log("app running");
});
