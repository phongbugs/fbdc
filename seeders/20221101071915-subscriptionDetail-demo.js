'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    var { faker } = require('@faker-js/faker');
    Array.prototype.random = function () {
      return this[Math.floor(Math.random() * this.length)];
    };
    var subscriptionDetail = [];
    Array.from({ length: 5000 }).forEach(() => {
      subscriptionDetail.push({
        subscriptionId: Array.from({ length: 1000 }, (_, i) => i + 1).random(),
        amount: [25000, 50000, 75000, 150000, 300000].random(),
        subscriptionDate: faker.date.birthdate(),
        createdAt: faker.date.birthdate(),
        updatedAt: faker.date.birthdate(),
      });
    });
    console.log(subscriptionDetail);
    await queryInterface.bulkInsert('subscriptiondetails', subscriptionDetail, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
