const express = require('express');
const upload = require('../config/multer');

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  res.json({
    imageUrl: req.file.path,
    publicId: req.file.filename,
  });
});

module.exports = router;
