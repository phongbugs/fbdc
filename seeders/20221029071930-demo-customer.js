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
    var customers = [];
    Array.from({ length: 1000 }).forEach(() => {
      customers.push({
        fullName: faker.internet.userName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        gender: [true, false].random(),
        birthday: faker.date.birthdate(),
        address: faker.address.city(),
        career: faker.word.adjective(),
        note: faker.lorem.paragraph().substring(0,100),
        createdAt: faker.date.birthdate(),
        updatedAt: faker.date.birthdate(),
      });
    });
    console.log(customers);
    await queryInterface.bulkInsert('customers', customers, {});
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
