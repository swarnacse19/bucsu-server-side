const express = require("express");
const crypto = require("crypto");
const { client } = require("../config/db");

const router = express.Router();

const votesCollection = client.db("BucsuDB").collection("votes");

router.get("/", async (req, res) => {
  try {
    const { electionId, userId } = req.query;

    if (!electionId || !userId) {
      return res.status(400).send({ voted: false });
    }

    const encryptedUserId = crypto
      .createHash("sha256")
      .update(String(userId))
      .digest("hex");

    const voted = await votesCollection.findOne({
      electionId: String(electionId),
      userId: encryptedUserId,
    });

    res.send({ voted: !!voted });
  } catch (err) {
    res.status(500).send({ message: "Vote check failed" });
  }
});

module.exports = router;