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

    // basic validation
    if (
      !election.title ||
      !election.description ||
      !election.type ||
      !election.startDate ||
      !election.endDate ||
      !Array.isArray(election.positions)
    ) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    // default fields
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
  const elections = await electionsCollection.find().toArray();
  res.send(elections);
});


// router.patch("/:id", async (req, res) => {
//   const id = req.params.id;
//   const update = req.body;

//   const result = await electionsCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: update }
//   );

//   res.send(result);
// });

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
