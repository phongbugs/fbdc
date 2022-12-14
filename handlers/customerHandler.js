const db = require('../models'),
  Customer = db.customer,
  log = console.log,
  create = (req, res) => {
    try {
      let body = req.body;
      let customer = {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
      };
      log(customer);
      Customer.create(customer)
        .then((data) => {
          res.send({ success: true, data: data });
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message || 'Some error occurred while creating the customer.',
          });
        });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  list = (req, res) => {
    let { start, limit } = req.query;
    Customer.findAll({
      offset: +start,
      limit: +limit,
      order: [['createdAt', 'DESC']],
    })
      .then(async (data) => {
        const count = await Customer.count();
        res.send({ records: data, totalCount: count });
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message:
            err.message || 'Some error occurred while retrieving customer.',
        });
      });
  },
  find = (req, res) => {
    let { searchValue } = req.query;
    log(searchValue);
    const Op = db.Sequelize.Op;
    Promise.all([
      Customer.findAll({
        where: {
          email: { [Op.like]: '%' + searchValue + '%' },
        },
      }),
      Customer.findAll({
        where: {
          fullName: { [Op.like]: '%' + searchValue + '%' },
        },
      }),
      Customer.findAll({
        where: {
          phone: { [Op.like]: '%' + searchValue + '%' },
        },
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
    Customer.update(req.body, {
      where: { id: id },
    })
      .then((num) => {
        log('num:%s', num);
        if (num[0] === 1) {
          res.send({
            success: true,
            message: 'Customer was updated successfully.',
          });
        } else {
          res.send({
            success: false,
            message: `Th??ng tin kh??ng c?? g?? thay ?????i`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: 'Error updating Customer with id=' + id + ' ' + err.message,
        });
      });
  },
  deleteCustomer = (req, res) => {
    const ids = req.params.ids.split(',').map((e) => +e);
    Customer.destroy({
      where: { id: ids },
    })
      .then((num) => {
        if (num == 1) {
          res.send({
            success: true,
            message: 'Customer was deleted successfully.',
          });
        } else {
          res.send({
            success: false,
            message: `Cannot delete Customer with id=${ids.toString()}. Maybe Tutorial was not found!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message: 'Could not delete Customer with ids=' + ids.toString(),
        });
      });
  };

module.exports = {
  create,
  list,
  find,
  update,
  deleteCustomer,
};
