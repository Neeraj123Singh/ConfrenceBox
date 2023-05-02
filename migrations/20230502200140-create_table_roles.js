'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('roles', 
        {
           id: {
            allowNull: false,
            primaryKey: true,
            defaultValue:Sequelize.UUIDV4,
            type: Sequelize.UUID
           },
           role: {
            type: Sequelize.STRING
           },
           created_at:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
           },
           updated_at:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
           }
        },
        {
          timeStamps: true,
          createdAt: true,
          updatedAt: true
        });
  },
  
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  }
};
