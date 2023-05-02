'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn(
    'users', // table name
    'name', // new field name
    {
      type: Sequelize.STRING,
      allowNull:false
    },
  );


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'name');
  }
};
