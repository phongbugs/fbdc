const db = require('../models'),
  Customer = db.customer,
  log = console.log,
  create = (req, res) => {
    try {
      let body = req.body;
      let customer = {
        phone: body.phone,
        name: body.name,
        age: body.age,
        gender: body.gender,
        career: body.career,
        address: body.address,
        disease_type: body.disease_type,
        re_examination_date: body.re_examination_date
          .split('/')
          .reverse()
          .join('-'),
        annual_examination: body.annual_examination,
        note: body.note,
      };
      log(customer);
      Customer.create(customer)
        .then((data) => {
          //log(data)
          //data.customer.dataValues.re_examination_date = data.customer.dataValues.re_examination_date.substr(0,10)
          res.send({ success: true, data: data });
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message || 'Some error occurred while creating the customer.',
          });
        });

      // else
      //   res.send({ success: false, message: 'Vui lòng đăng nhập' });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  list = (req, res) => {
    Customer.findAll()
      .then((data) => {
        res.send(data);
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
    req.body.re_examination_date = req.body.re_examination_date
      .split('/')
      .reverse()
      .join('-');
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
            message: `Thông tin không có gì thay đổi`,
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
    const id = req.params.id;
    Customer.destroy({
      where: { id: id },
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
            message: `Cannot delete Customer with id=${id}. Maybe Tutorial was not found!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message: 'Could not delete Customer with id=' + id,
        });
      });
  };

module.exports = {
  create,
  list,
  update,
  deleteCustomer,
};
