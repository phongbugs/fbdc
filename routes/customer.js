const express = require('express'),
  router = express.Router(),
  customerHandler = require('../handlers/customerHandler');

router.post('/create', customerHandler.create);
router.put('/update', customerHandler.update);
router.get('/list', customerHandler.list);
router.delete('/delete/:ids', customerHandler.deleteCustomer);

module.exports = router;
