'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('users', 
        {
           id: {
            allowNull: false,
            primaryKey: true,
            defaultValue:Sequelize.UUIDV4,
            type: Sequelize.UUID
           },
           role_id: {
            references: {
              model: 'roles', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            allowNull: false,
            type: Sequelize.UUID
           },
           email: {
            type: Sequelize.STRING,
            allowNull:false
           },
           phone: {
            type: Sequelize.STRING,
            allowNull:false
           },
           password:{
            type: Sequelize.STRING,
            allowNull:false
           },
           profession:{
            type: Sequelize.STRING,
            allowNull:false
           },
           description:{
            type: Sequelize.STRING,
            allowNull:false
           },
           profile_picture:{
            type: Sequelize.STRING
           },
           status:{
            type: Sequelize.BOOLEAN,
            defaultValue:true
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
    await queryInterface.dropTable('users');
  }
};
