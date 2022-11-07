const express = require('express'),
  router = express.Router(),
  subscriptionHandler = require('../handlers/subscriptionHandler');

router.post('/create', subscriptionHandler.create);
router.put('/update', subscriptionHandler.update);
router.get('/list', subscriptionHandler.list);
router.get('/find', subscriptionHandler.find);
router.delete('/delete/:ids', subscriptionHandler.deleteSubscription);

module.exports = router;
