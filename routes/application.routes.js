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
  try {
    const { status, email } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (email) {
      query.email = email;
    }

    const applications = await applicationsCollection
      .find(query)
      .sort({ appliedAt: -1 })
      .toArray();

    res.send(applications);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch applications" });
  }
});

module.exports = router;