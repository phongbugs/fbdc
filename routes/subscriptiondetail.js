const express = require('express'),
  router = express.Router(),
  subscriptionDetailHandler = require('../handlers/subscriptionDetailHandler');

router.post('/create', subscriptionDetailHandler.create);
router.put('/update', subscriptionDetailHandler.update);
router.get('/list', subscriptionDetailHandler.list);
router.delete('/delete/:ids', subscriptionDetailHandler.deleteSubscriptionDetail);
module.exports = router;
