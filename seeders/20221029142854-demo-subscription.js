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
    var subscription = [];
    Array.from({ length: 1000 }).forEach(() => {
      subscription.push({
        customerId: Array.from({ length: 1000 }, (_, i) => i + 1).random(),
        totalAmount:[25000, 50000, 75000, 150000, 300000].random(),
        totalDay: [30, 60, 90, 180, 360].random(),
        expiredDate: faker.date.birthdate(),
        status:[true, false].random(),
        createdAt: faker.date.birthdate(),
        updatedAt: faker.date.birthdate(),
      });
    });
    console.log(subscription);
    await queryInterface.bulkInsert('subscriptions', subscription, {});
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
