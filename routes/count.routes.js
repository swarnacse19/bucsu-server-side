const express = require("express");
const { client } = require("../config/db");
const router = express.Router();

const votesCollection = client
  .db("BucsuDB")
  .collection("votes");

router.get("/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidatesCollection = client.db("BucsuDB").collection("candidateApplications");
    const approvedCandidates = await candidatesCollection.find({
      electionId,
      status: "approved"
    }).toArray();

    const votes = await votesCollection.find({ electionId }).toArray();

    const voteCounts = {};
    votes.forEach(voteDoc => {
      voteDoc.votes.forEach(v => {
        voteCounts[v.studentId] = (voteCounts[v.studentId] || 0) + 1;
      });
    });

    const positionsMap = {};
    approvedCandidates.forEach(cand => {
      if (!positionsMap[cand.position]) {
        positionsMap[cand.position] = [];
      }
      positionsMap[cand.position].push({
        studentId: cand.studentId,
        name: cand.name,
        photo: cand.photo,
        department: cand.department,
        votes: voteCounts[cand.studentId] || 0
      });
    });

    const finalResults = Object.keys(positionsMap).map(position => {
      const candidates = positionsMap[position];

      candidates.sort((a, b) => b.votes - a.votes);

      const isDraw = candidates.length > 1 && candidates[0].votes === candidates[1].votes;

      return {
        position,
        isDraw,
        winner: isDraw ? null : (candidates[0] || null),
        candidates
      };
    });

    res.send(finalResults);
  } catch (error) {
    console.error("Counting error:", error);
    res.status(500).send({
      message: "Failed to count results",
    });
  }
});

module.exports = router;
