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


router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const election = await electionsCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(election);
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

// router.patch("/:id/start", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await electionsCollection.updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: {
//           status: "active",
//           startedAt: new Date(),
//         },
//       }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).send({ message: "Election not found" });
//     }

//     res.send({
//       message: "Election started successfully",
//       updated: true,
//     });
//   } catch (error) {
//     res.status(500).send({ message: "Failed to start election" });
//   }
// });



router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const result = await electionsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

module.exports = router;
