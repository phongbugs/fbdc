const db = require('../models'),
  SubscriptionDetail = db.subscriptionDetail,
  log = console.log,
  create = (req, res) => {
    try {
      let body = req.body;
      let subscriptionDetail = {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
      };
      log(subscriptionDetail);
      SubscriptionDetail.create(subscriptionDetail)
        .then((data) => {
          res.send({ success: true, data: data });
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message ||
              'Some error occurred while creating the subscription.',
          });
        });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  list = (req, res) => {
    // try {
    //   let { start, limit } = req.query;
    //   SubscriptionDetail.findAll({
    //     attributes: [
    //       'id',
    //       'customerId',
    //       'totalAmount',
    //       'status',
    //       'expiredDate',
    //     ],
    //     include: [
    //       {
    //         model: db.subscriptionDetail,
    //         attributes: ['subscriptionId', 'amount', 'subscriptionDate'],
    //         required: true,
    //       },
    //       {
    //         model: db.customer,
    //         attributes: ['fullName', 'email'],
    //         required: true,
    //       },
    //     ],
    //     offset: +start,
    //     limit: +limit,
    //     order: [['expiredDate', 'DESC']],
    //   })
    //     .then(async (data) => {
    //       const count = await Subscription.count();
    //       res.send({ records: data, totalCount: count, success: true });
    //     })
    //     .catch((err) => {
    //       res.status(500).send({
    //         success: false,
    //         message:
    //           err.message ||
    //           'Some error occurred while retrieving subscription.',
    //       });
    //     });
    // } catch (error) {
    //   log(err);
    // }
  },
  update = (req, res) => {
    // const id = req.body.id;
    // SubscriptionDetail.update(req.body, {
    //   where: { id: id },
    // })
    //   .then((num) => {
    //     log('num:%s', num);
    //     if (num[0] === 1) {
    //       res.send({
    //         success: true,
    //         message: 'subscription detail was updated successfully.',
    //       });
    //     } else {
    //       res.send({
    //         success: false,
    //         message: `Thông tin không có gì thay đổi`,
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     res.status(500).send({
    //       message:
    //         'Error updating subscription detail with id=' +
    //         id +
    //         ' ' +
    //         err.message,
    //     });
    //   });
  },
  deleteSubscriptionDetail = (req, res) => {
    try {
      var ids = [];
      if (req.params.ids) ids = req.params.ids.split(',').map((e) => +e);
      //else if (req.body.ids) ids = req.body.ids.split(',').map((e) => +e);
      SubscriptionDetail.destroy({
        where: { id: ids },
      })
        .then((num) => {
          log(num);
          if (Number.isInteger(num)) {
            res.send({
              success: true,
              message: `Subscription detail was deleted successfully ${ids.length} records.`,
            });
          } else {
            res.send({
              success: false,
              message: `Cannot delete subscription detail with id=${ids.toString()}. Maybe Tutorial was not found!`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              'Could not delete subscription detail with ids=' +
              ids.toString() +
              ' ' +
              err,
          });
        });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error,
      });
    }
  };

module.exports = {
  create,
  list,
  update,
  deleteSubscriptionDetail,
};
