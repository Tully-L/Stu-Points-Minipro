const express = require('express');
const router = express.Router();

router.get('/check', (req, res) => {
  res.json({
    success: true,
    message: 'Token 有效'
  });
});

module.exports = router;