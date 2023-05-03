const { verify } = require('crypto');
const { sequelize, User, Role } = require('../../models');
const { QueryTypes } = require('sequelize');
var uuid = require('node-uuid');
const { logger } = require('../helpers/logger');



const createConfrence = async (data) => {
    let id   = uuid.v4();
    let query = `insert into confrence(id,title,agenda,date,place,created_by,status,created_at,updated_at) values(?,?,?,?,?,?,?,now(),now()) `
    let bindParams = [id, data.title,data.agenda,data.date,data.place,data.created_by,data.status]
    console.log(bindParams)
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.INSERT });
    query = `select * from confrence where id  = ?`;
    bindParams = [id];
    let confrence = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return confrence[0];
};

const editConfrence = async (data,id) => {
    let query = `update confrence set title =?,agenda =?,date=?,place=?,status=?,updated_at = ? where id  = ? `
    let bindParams = [ data.title,data.agenda,data.date,data.place,data.status,data.updated_at,id]
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
    query = `select * from confrence where id  = ?`;
    bindParams = [id];
    let confrence = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return confrence[0];
};

const getConfrenceById = async (id,status=true) => {
    let query = ` select * from confrence where id  = ? `;
    if(status) query+= ` and status = 'active' `;
    let bindParams = [id]
    let confrence  = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return confrence[0];
};

const getUserConfrence = async (conference_id,user_id) => {
    let query = ` select * from confrence_speaker where confrence_id = ? and user_id = ? `
    let bindParams = [conference_id,user_id]
    let confrence  = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return confrence[0];
};

const registerConfrence = async (conference_id,user_id) => {
    let query = ` insert into confrence_speaker(id,confrence_id,user_id) values(?,?,?) `
    let bindParams = [uuid.v4(),conference_id,user_id]
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.INSERT });

};


const getAllConfrence = async (where, search, offset, limit) => {
    let bindParams = [];
    let query = ' select * from confrence c  ';
    let queryCount = ' SELECT count(*) as total_count  FROM  confrence c ';
    let and = false;
    //apply fiter in the query [Neeraj Singh]
    if (where && where.length != 0) {
        for (let i = 0; i < where.length; i++) {
            if (and == false) {
                query += ' where ';
                queryCount += ' where ';
                and = true;
            } else {
                query += ' and ';
                queryCount += ' and ';
                and = true;
            }
            if (where[i][1] !== null) {
                query += where[i][0] + ' = ? ';
                queryCount += where[i][0] + ' = ? ';
                bindParams.push(where[i][1])
            } else {
                query += where[i][0];
                queryCount += where[i][0];
            }
        }
    }
    //apply search in the query [Neeraj Signh]
    if (search && search.length != 0) {
        for (let i = 0; i < search.length; i++) {
            if (and == false && i == 0) {
                query += ' where ';
                queryCount += ' where ';
                and = true;
            }
            else if (i == 0 && and == true) {
                query += ' and ';
                queryCount += ' and ';
                and = true;
            }
            if (i == 0) {
                query += '  ( ';
                queryCount += ' ( ';
            }
            if (i != 0) {
                query += ' or ';
                queryCount += ' or ';
            }
            query += search[i][0] + ' ' + search[i][1] + ' ? ';
            queryCount += search[i][0] + ' ' + search[i][1] + ' ? ';
            if (i == search.length - 1) {
                query += ' ) ';
                queryCount += ' ) ';
            }
            bindParams.push(search[i][2]);
        }
    }
    query += `order by c.created_at desc `
    if (offset || limit) query += ` limit ${limit} offset ${offset} `;
    let users = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    const totalCount = await sequelize.query(queryCount, { replacements: bindParams, type: QueryTypes.SELECT });
    return { users: users, totalCount: totalCount[0].total_count };
};


const unRegisterConfrence= async (conference_id,user_id) => {
    let query = ` delete from  confrence_speaker where confrence_id = ? and user_id = ? `
    let bindParams = [conference_id,user_id]
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.INSERT });

}

const getAllUsersOfConfrence = async (conference_id) => {
    let query = ` select * from  confrence_speaker where confrence_id = ?  `
    let bindParams = [conference_id]
    let users = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return users;
}

module.exports = {
    createConfrence,
    editConfrence,
    getAllConfrence,
    getConfrenceById,
    getUserConfrence,
    registerConfrence,
    unRegisterConfrence,
    getAllUsersOfConfrence
};
