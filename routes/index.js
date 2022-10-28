const express = require('express'),
  router = express.Router();
router.get('/', (_, res) => res.sendFile('index.html'));

module.exports = router;
