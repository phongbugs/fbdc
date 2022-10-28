const express = require('express'),
  router = express.Router(),
  customerHandler = require('../handlers/customerHandler'),
  requireAuth = require('../handlers/auth').isAuthenticated;

router.post('/create', customerHandler.create);
router.put('/update', customerHandler.update);
//router.get('/list', requireAuth, customerHandler.list);
router.get('/list', customerHandler.list);
router.delete('/delete/:id', customerHandler.deleteCustomer);

module.exports = router;
