const express = require("express");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

const applicationsCollection = client
  .db("BucsuDB")
  .collection("candidateApplications");

router.get("/:electionId", async (req, res) => {
  const { electionId } = req.params;

  const candidates = await applicationsCollection
    .find({ electionId, status: "approved" })
    .toArray();

  res.send(candidates);
});

module.exports = router;