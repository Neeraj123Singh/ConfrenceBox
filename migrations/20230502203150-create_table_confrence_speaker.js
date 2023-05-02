'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('confrence_speaker', 
        {
           id: {
            allowNull: false,
            primaryKey: true,
            defaultValue:Sequelize.UUIDV4,
            type: Sequelize.UUID
           },
           confrence_id:{
            references: {
              model: 'confrence', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            type: Sequelize.UUID,
            allowNull:false
           },
           user_id:{
            references: {
              model: 'users', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            type: Sequelize.UUID,
            allowNull:false
           },
           speaker_id:{
            references: {
              model: 'users', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            type: Sequelize.UUID
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
    await queryInterface.dropTable('confrence_speaker');
  }
};
