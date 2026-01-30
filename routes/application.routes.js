const express = require("express");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

const applicationsCollection = client
  .db("BucsuDB")
  .collection("candidateApplications");

router.post("/", async (req, res) => {
  const data = req.body;

  const result = await applicationsCollection.insertOne(data);

  res.send({
    success: true,
    insertedId: result.insertedId,
  });
});

router.get("/", async (req, res) => {
  const applications = await applicationsCollection.find().toArray();

  res.send(applications);
});

module.exports = router;