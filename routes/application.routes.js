const express = require("express");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

const applicationsCollection = client
  .db("BucsuDB")
  .collection("candidateApplications");

router.post("/", async (req, res) => {
  const data = req.body;

  if (!data.electionId) {
    return res.status(400).send({ message: "Election ID is required" });
  }

  const existing = await applicationsCollection.findOne({
    email: data.email,
    electionId: data.electionId,
  });

  if (existing) {
    return res.status(400).send({ message: "You have already applied for this election." });
  }

  const result = await applicationsCollection.insertOne(data);

  res.send({
    success: true,
    insertedId: result.insertedId,
  });
});

router.get("/", async (req, res) => {
  try {
    const { status, email, electionId } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (email) {
      query.email = email;
    }

    if (electionId) {
      query.electionId = electionId;
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

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).send({ message: "Invalid status value" });
    }

    const result = await applicationsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          reviewedAt: new Date(),
        },
      }
    );

    res.send({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to update application status" });
  }
});

module.exports = router;