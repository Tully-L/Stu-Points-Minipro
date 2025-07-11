const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { openid } = req.user;
  const { points, reason } = req.body;

  if (!points || !reason) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  res.json({
    success: true,
    data: {
      points: points,
      reason: reason,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;

