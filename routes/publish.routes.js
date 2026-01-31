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

router.get("/", async (req, res) => {
  try {
    const results = await resultsCollection
      .find({})
      .project({
        electionId: 1,
        electionName: 1,
        publishedAt: 1,
      })
      .sort({ publishedAt: -1 })
      .toArray();

    res.send(results);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch results" });
  }
});

router.get("/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = await resultsCollection.findOne({ electionId });

    if (!result) {
      return res.status(404).send({ message: "Result not found" });
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch result" });
  }
});

router.get("/check/:electionId", async (req, res) => {
  const { electionId } = req.params;

  const result = await resultsCollection.findOne({ electionId });

  if (result) {
    res.send({ counted: true });
  } else {
    res.send({ counted: false });
  }
});


module.exports = router;