const express = require('express');
const { client } = require('../config/db');
const { ObjectId } = require('mongodb');

const router = express.Router();

const usersCollection = client
  .db("BucsuDB")
  .collection("users");

router.post("/", async (req, res) => {
  const email = req.body.email;
  const userExists = await usersCollection.findOne({ email });
  if (userExists) {
    return res
      .status(200)
      .send({ message: "User already exists", inserted: false });
  }
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

router.get("/", async (req, res) => {
  const users = await usersCollection.find().toArray();
  res.send(users);
});

router.get("/:email", async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send(user);
});

router.delete("/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  const result = await usersCollection.deleteOne({ _id: id });
  res.send(result);
});


module.exports = router;