const express = require("express");
const { client } = require("../config/db");
const router = express.Router();

const votesCollection = client
  .db("BucsuDB")
  .collection("votes");

router.get("/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const votes = await votesCollection
      .find({ electionId })
      .toArray();

    const resultMap = {};
    const candidateInfo = {}; 

    votes.forEach(voteDoc => {
      voteDoc.votes.forEach(v => {
        // position init
        if (!resultMap[v.position]) {
          resultMap[v.position] = {};
        }

        // candidate init
        if (!resultMap[v.position][v.studentId]) {
          resultMap[v.position][v.studentId] = 0;

          // store candidate info once
          candidateInfo[v.studentId] = {
            studentId: v.studentId,
            name: v.name,
            photo: v.photo,
          };
        }

        // vote count
        resultMap[v.position][v.studentId]++;
      });
    });

    const finalResults = Object.keys(resultMap).map(position => {
      const candidates = Object.entries(resultMap[position]).map(
        ([studentId, votes]) => ({
          studentId,
          name: candidateInfo[studentId]?.name,
          photo: candidateInfo[studentId]?.photo,
          votes,
        })
      );

      // sort by votes desc
      candidates.sort((a, b) => b.votes - a.votes);

      return {
        position,
        winner: candidates[0], 
        candidates,
      };
    });

    res.send(finalResults);
  } catch (error) {
    res.status(500).send({
      message: "Failed to count results",
    });
  }
});

module.exports = router;
