'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('confrence', 
        {
           id: {
            allowNull: false,
            primaryKey: true,
            defaultValue:Sequelize.UUIDV4,
            type: Sequelize.UUID
           },
           title: {
            type: Sequelize.STRING,
            allowNull:false
           },
           agenda: {
            type: Sequelize.STRING,
            allowNull:false
           },
           date:{
            type: Sequelize.DATE,
            allowNull:false
           },
           place:{
            type: Sequelize.STRING,
            allowNull:false
           },
           created_by:{
            references: {
              model: 'users', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            type: Sequelize.UUID,
            allowNull:false
           },
           speaker:{
            references: {
              model: 'users', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            type: Sequelize.UUID
           },
           status:{
            type: Sequelize.STRING,
            defaultValue:"active"
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
    await queryInterface.dropTable('confrence');
  }
};
