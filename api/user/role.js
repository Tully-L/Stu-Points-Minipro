const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { openid } = req.user;
  
  res.json({
    success: true,
    data: {
      role: 'student'
    }
  });
});

module.exports = router;
