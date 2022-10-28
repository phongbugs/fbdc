module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define('customer', {
    phone: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    age: {
      type: Sequelize.INTEGER,
    },
    gender: {
      type: Sequelize.INTEGER,
    },
    career: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    disease_type: {
      type: Sequelize.STRING,
    },
    re_examination_date: {
      type: Sequelize.DATE,
    },
    annual_examination: {
      type: Sequelize.INTEGER,
    },
    note: {
      type: Sequelize.STRING,
    },
  });
  return Customer;
};
