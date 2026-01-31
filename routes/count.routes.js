const express = require("express");
const { client } = require("../config/db");
const router = express.Router();

const votesCollection = client
  .db("BucsuDB")
  .collection("votes");

router.get("/:electionId", async (req, res) => {
  const { electionId } = req.params;

  const votes = await votesCollection
    .find({ electionId })
    .toArray();

  const resultMap = {};

  votes.forEach(voteDoc => {
    voteDoc.votes.forEach(v => {
      if (!resultMap[v.position]) resultMap[v.position] = {};
      if (!resultMap[v.position][v.studentId]) {
        resultMap[v.position][v.studentId] = 0;
      }
      resultMap[v.position][v.studentId]++;
    });
  });

  const finalResults = Object.keys(resultMap).map(position => {
    const candidates = Object.entries(resultMap[position]).map(
      ([studentId, votes]) => ({ studentId, votes })
    );

    candidates.sort((a, b) => b.votes - a.votes);

    return {
      position,
      winner: candidates[0],
      candidates,
    };
  });

  res.send(finalResults);
});

module.exports = router;

