const db = require('../models'),
  SubscriptionDetail = db.subscriptionDetail,
  Subscription = db.subscription,
  log = console.log,
  {
    getDayQuantity,
    formatDate,
    isExpiredDate,
    getExpiredDate,
  } = require('./util'),
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
  getSubscriptionById = async (subscriptionId) => {
    return await Subscription.findOne({
      attributes: ['totalAmount', 'totalDay', 'status', 'expiredDate'],
      where: {
        id: subscriptionId,
      },
    });
  },
  list = (req, res) => {},
  update = (req, res) => {},
  deleteSubscriptionDetail = (req, res) => {
    try {
      var ids = [];
      var { subscriptionId, amount, isUpdateSubscription, subscriptionDate } =
        req.body;
      if (req.params.ids) ids = req.params.ids.split(',').map((e) => +e);
      log(ids);
      log(subscriptionId);
      SubscriptionDetail.destroy({
        where: { id: ids },
      })
        .then(async (num) => {
          log(num);
          if (Number.isInteger(num)) {
            if (isUpdateSubscription) {
              let subcription = await getSubscriptionById(subscriptionId);
              log(subcription);
              let totalAmount = subcription.totalAmount - +amount;
              let totalDay = subcription.totalDay - getDayQuantity(+amount);
              subscriptionDate = new Date(subscriptionDate);
              let expiredDate = getExpiredDate(subscriptionDate, totalDay);
              log(subscriptionDate);
              log(totalAmount);
              log(totalDay);
              let updatedSubscription = {
                totalAmount,
                totalDay,
                expiredDate: expiredDate,
                status: !isExpiredDate(expiredDate),
              };
              log(updatedSubscription);
              Subscription.update(updatedSubscription, {
                where: { id: +subscriptionId },
              })
                .then((num) => {
                  log('num:%s', num);
                  if (num[0] === 1) {
                    res.send({
                      success: true,
                      message: `Delete subscription detail id=${ids} successfully and update subscription id=${subscriptionId} successfully`,
                    });
                  } else {
                    res.send({
                      success: false,
                      message: `No change has been made`,
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    message: `Error delete subscription detail id=${ids}: ${err.message}`,
                  });
                });
            } else {
              res.send({
                success: true,
                message: `Subscription detail was deleted successfully ${ids.length} records.`,
              });
            }
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
