const express = require("express");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

const electionsCollection = client
  .db("BucsuDB")
  .collection("elections");

router.post("/", async (req, res) => {
  try {
    const election = req.body;

    if (
      !election.title ||
      !election.description ||
      !election.type ||
      !election.startDate ||
      !election.endDate
    ) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    if (['district', 'department', 'cr'].includes(election.type)) {
      if (!Array.isArray(election.positions) || election.positions.length === 0) {
        return res.status(400).send({ message: "Positions are required for this election type" });
      }
    }

    if (election.type === 'custom') {
      if (!Array.isArray(election.customStructure) || election.customStructure.length === 0) {
        return res.status(400).send({ message: "Custom structure is required for custom elections" });
      }
    }

    election.status = "draft";
    election.createdAt = new Date();

    const result = await electionsCollection.insertOne(election);

    res.send({
      message: "Election created successfully",
      inserted: true,
      result,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to create election" });
  }
});


router.get("/", async (req, res) => {
  const elections = await electionsCollection.find().sort({ createdAt: -1 }).toArray();
  res.send(elections);
});


router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const update = req.body;

  const result = await electionsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );

  res.send(result);
});

router.get("/ongoing", async (req, res) => {
  try {
    const now = new Date();

    const ongoingElections = await electionsCollection
      .aggregate([
        {
          $addFields: {
            startDateObj: { $toDate: "$startDate" },
            endDateObj: { $toDate: "$endDate" },
          },
        },
        {
          $match: {
            startDateObj: { $lte: now },
            endDateObj: { $gte: now },
          },
        },
      ])
      .toArray();

    res.send(ongoingElections);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch ongoing elections" });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const now = new Date();

    const upcomingElections = await electionsCollection
      .aggregate([
        {
          $addFields: {
            startDateObj: { $toDate: "$startDate" },
          },
        },
        {
          $match: {
            startDateObj: { $gt: now },
          },
        },
      ])
      .toArray();

    res.send(upcomingElections);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch upcoming elections" });
  }
});

router.get("/ended", async (req, res) => {
  try {
    const now = new Date();

    const endedElections = await electionsCollection
      .aggregate([
        {
          $addFields: {
            endDateObj: { $toDate: "$endDate" },
          },
        },
        {
          $match: {
            endDateObj: { $lt: now },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    res.send(endedElections);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch ended elections" });
  }
});


router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const election = await electionsCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(election);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const result = await electionsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

module.exports = router;
