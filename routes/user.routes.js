const express = require('express');
const { client } = require('../config/db');

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


module.exports = router;