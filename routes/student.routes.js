const express = require('express');
const { client } = require('../config/db');

const router = express.Router();

const studentsCollection = client
  .db("BucsuDB")
  .collection("students");

  router.post("/", async (req, res) => {
  const email = req.body.email;
  const userExists = await studentsCollection.findOne({ email });
  if (userExists) {
    return res
      .status(200)
      .send({ message: "User already exists", inserted: false });
  }
  const user = req.body;
  const result = await studentsCollection.insertOne(user);
  res.send(result);
});

module.exports = router;