const db = require('../models'),
  Subscription = db.subscription,
  SubscriptionDetails = db.subscriptionDetail,
  log = console.log,
  getDayQuantity = (amount) => {
    var day = 0;
    switch (amount) {
      case 25000:
        day = 30;
        break;
      case 50000:
        day = 60;
        break;
      case 75000:
        day = 90;
        break;
      case 150000:
        day = 180;
        break;
      case 300000:
        day = 360;
        break;
    }
    return day;
  },
  formatDate = (date) => date.split('/').reverse().join('-'),
  isExpiredDate = (supscriptionDate, amount) => {
    let currentDate = new Date(),
      expiredDate = getExpiredDate(supscriptionDate, amount);
    return expiredDate.getTime() - currentDate.getTime() < 0;
  },
  getExpiredDate = (subscriptionDate, totalDay) => {
    return new Date(subscriptionDate.getTime() + totalDay * 24 * 3600 * 1000);
  },
  findNonexpiredSubscriptionByCustomerId = async (customerId) => {
    return await Subscription.findOne({
      include: [
        {
          model: db.customer,
          //attributes: ['fullName', 'email'],
          where: {
            id: customerId,
          },
          required: true,
        },
      ],
      where: {
        status: true,
      },
      order: [['expiredDate', 'DESC']],
    });
  },
  createSubscription = (req, res) => {
    let body = req.body;
    log(body);
    let customerId = body.customerId || body.id;
    let amount = +body.amount;
    let subscriptionDate = new Date(formatDate(body.subscriptionDate));
    let totalDay = getDayQuantity(amount);
    let subscription = {
      customerId: +customerId,
      totalAmount: amount,
      totalDay: totalDay,
      expiredDate: getExpiredDate(subscriptionDate, totalDay),
      status: !isExpiredDate(subscriptionDate, amount),
    };
    Subscription.create(subscription)
      .then((data) => {
        SubscriptionDetails.create({
          subscriptionId: data.id,
          amount: amount,
          subscriptionDate: subscriptionDate,
        });
        res.send({ success: true, data: data });
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message:
            err.message ||
            'Some error occurred while creating new subscription.',
        });
      });
  },
  updateSubscription = (req, res, availableSubscription) => {
    let body = req.body;
    let subscriptionId = availableSubscription.id;
    SubscriptionDetails.create({
      subscriptionId: subscriptionId,
      amount: +body.amount,
      subscriptionDate: body.subscriptionDate,
    }).then((data) => {
      let customerId = body.customerId || body.id;
      let amount = +body.amount + availableSubscription.totalAmount;
      let subscription = {
        customerId: +customerId,
        totalAmount: amount,
        totalDay: (amount / 25000) * 30,
      };
      Subscription.update(subscription, {
        where: { id: subscriptionId },
      })
        .then(() => res.send({ success: true, data: data }))
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message || 'Some error occurred while updating subscription.',
          });
        });
    });
  },
  create = async (req, res) => {
    try {
      let customerId = req.body.customerId || req.body.id;
      let availableSubscription = await findNonexpiredSubscriptionByCustomerId(
        customerId
      );
      if (availableSubscription) {
        updateSubscription(req, res, availableSubscription);
      } else {
        createSubscription(req, res);
      }
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  list = (req, res) => {
    try {
      let { start, limit } = req.query;
      Subscription.findAll({
        attributes: [
          'id',
          'customerId',
          'totalAmount',
          'totalDay',
          'status',
          'expiredDate',
        ],
        include: [
          {
            model: db.subscriptionDetail,
            attributes: ['id', 'subscriptionId', 'amount', 'subscriptionDate'],
            required: true,
          },
          {
            model: db.customer,
            attributes: ['fullName', 'email'],
            //required: true,
          },
        ],
        offset: +start,
        limit: +limit,
        order: [['expiredDate', 'DESC']],
      })
        .then(async (data) => {
          const count = await Subscription.count();
          res.send({ records: data, totalCount: count, success: true });
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message ||
              'Some error occurred while retrieving subscription.',
          });
        });
    } catch (error) {
      log(err);
    }
  },
  find = (req, res) => {
    let { searchValue } = req.query;
    log(searchValue);
    const Op = db.Sequelize.Op;
    Promise.all([
      Subscription.findAll({
        include: [
          {
            model: db.subscriptionDetail,
            attributes: ['id', 'subscriptionId', 'amount', 'subscriptionDate'],
            required: true,
          },
          {
            model: db.customer,
            attributes: ['fullName', 'email'],
            where: {
              email: { [Op.like]: '%' + searchValue + '%' },
            },
            required: true,
          },
        ],
      }),
      Subscription.findAll({
        include: [
          {
            model: db.subscriptionDetail,
            attributes: ['id', 'subscriptionId', 'amount', 'subscriptionDate'],
            required: true,
          },
          {
            model: db.customer,
            attributes: ['fullName', 'email'],
            where: {
              fullName: { [Op.like]: '%' + searchValue + '%' },
            },
            required: true,
          },
        ],
      }),
    ])
      .then(async (data) => {
        data = data.flat();
        res.send({ records: data, totalCount: data.length, success: true });
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message:
            err.message || 'Some error occurred while retrieving customer.',
        });
      });
  },
  update = (req, res) => {
    const id = req.body.id;
    Subscription.update(req.body, {
      where: { id: id },
    })
      .then((num) => {
        log('num:%s', num);
        if (num[0] === 1) {
          res.send({
            success: true,
            message: 'subscription was updated successfully.',
          });
        } else {
          res.send({
            success: false,
            message: `Thông tin không có gì thay đổi`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            'Error updating subscription with id=' + id + ' ' + err.message,
        });
      });
  },
  deleteSubscription = (req, res) => {
    const ids = req.params.ids.split(',').map((e) => +e);
    Subscription.destroy({
      where: { id: ids },
    })
      .then((num) => {
        if (Number.isInteger(num)) {
          res.send({
            success: true,
            message: `Subscription was deleted successfully ${ids.length} records.`,
          });
        } else {
          res.send({
            success: false,
            message: `Cannot delete subscription with id=${ids.toString()}. Maybe Tutorial was not found!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message: 'Could not delete subscription with ids=' + ids.toString(),
        });
      });
  };

module.exports = {
  create,
  list,
  find,
  update,
  deleteSubscription,
};
