'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn(
    'users', // table name
    'verified', // new field name
    {
      type: Sequelize.BOOLEAN,
      defaultValue:false
    },
  );
  await queryInterface.addColumn(
    'users', // table name
    'token_updated_at', // new field name
    {
      type: Sequelize.DATE,
      allowNull:true
    },
  );


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'verified');
    await queryInterface.removeColumn('users', 'token_updated_at');
  }
};
