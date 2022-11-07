const db = require('../models'),
  Subscription = db.subscription,
  log = console.log,
  create = (req, res) => {
    try {
      let body = req.body;
      let subscription = {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
      };
      log(subscription);
      Subscription.create(subscription)
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
    try {
      let { start, limit } = req.query;
      Subscription.findAll({
        attributes: [
          'id',
          'customerId',
          'totalAmount',
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
