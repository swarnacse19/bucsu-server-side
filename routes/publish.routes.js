const express = require("express");
const { client } = require("../config/db");
const router = express.Router();

const resultsCollection = client
  .db("BucsuDB")
  .collection("results");

router.post("/publish", async (req, res) => {
  const resultData = req.body;

  const exists = await resultsCollection.findOne({
    electionId: resultData.electionId,
  });

  if (exists) {
    return res.status(400).send({ message: "Result already published" });
  }

  resultData.publishedAt = new Date();

  await resultsCollection.insertOne(resultData);
  res.send({ success: true });
});

module.exports = router;