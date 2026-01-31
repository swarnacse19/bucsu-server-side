const express = require("express");
const { client } = require("../config/db");
const crypto = require("crypto"); 
const router = express.Router();

const votesCollection = client
  .db("BucsuDB")
  .collection("votes");

router.post("/", async (req, res) => {
  try {
    const { electionId, userId, votes } = req.body;

    if (!electionId || !userId || !votes?.length) {
      return res.status(400).send({ message: "Invalid vote data" });
    }

    const encryptedUserId = crypto
      .createHash("sha256")
      .update(userId)
      .digest("hex");

    const exists = await votesCollection.findOne({
      electionId,
      userId: encryptedUserId,
    });

    if (exists) {
      return res.status(400).send({ message: "Already voted" });
    }

    await votesCollection.insertOne({
      electionId,
      userId: encryptedUserId,
      votes, // [{ position, studentId }]
      createdAt: new Date(),
    });

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Vote failed" });
  }
});

module.exports = router;
