const { verify } = require('crypto');
const { sequelize, User, Role } = require('../../models');
const { QueryTypes } = require('sequelize');
var uuid = require('node-uuid');
const { logger } = require('../helpers/logger');
const { off } = require('process');


const signUp = async (data) => {
    let query = `insert into users(id,email,name,role_id,phone,password,description,profession,profile_picture,otp,otp_created_at,created_at,updated_at) values(?,?,?,?,?,?,?,?,?,?,?,now(),now()) `
    let bindParams = [uuid.v4(), data.email, data.name, data.role, data.phone, data.password,data.description,data.profession,data.profile_picture,data.otp,data.otpCreatedAt]
    console.log(bindParams)
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.INSERT });
    query = `select u.id as id , u.email as email,u.name as name,u.phone as phone  from users u where email = ?`;
    bindParams = [data.email];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
};



const getAllUsers = async (where, search, offset, limit) => {
    let bindParams = [];
    let query = ' SELECT u.id as id ,u.name as user_name, u.created_at, u.updated_at,u.status as status,u.email as user_email,u.phone as user_phone,r.role as role   FROM users u left join roles r on u.role_id = r.id  ';
    let queryCount = ' SELECT count(*) as total_count  FROM  users u left join roles r on u.role_id = r.id ';
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
    query += `order by u.created_at desc `
    if (offset || limit) query += ` limit ${limit} offset ${offset} `;
    let users = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    const totalCount = await sequelize.query(queryCount, { replacements: bindParams, type: QueryTypes.SELECT });
    return { users: users, totalCount: totalCount[0].total_count };
};


const findUser = async (email) => {
    try {
        let query = ' SELECT u.id as id ,u.otp_created_at as otp_created_at,u.status as status,u.token_updated_at as token_updated_at,u.password as password,u.name as userName,u.verified as verified,u.email as user_email,u.otp as otp,u.phone as userPhone,r.role as role FROM users u left join roles r on u.role_id = r.id   where u.email=?';
        let bindParams = [email];
        let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
        return user[0];
    } catch (error) {
        console.log(error)
        logger.info(error)
    }
}







const updateUser = async (where, data) => {
    let query = `update users set name=?,description=?,profession=?,profile_picture=?,token_updated_at = now(),updated_at =now() where email = ?`;
    let bindParams = [data.name, data.description, data.profession, data.profile_picture,  where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
    query = `select u.id as id , u.email as email,u.name as name,u.phone as phone  from users u where email = ?`;
    bindParams = [where.where.email];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
}
const updateUserOtp = async (where, data) => {
    let query = `update users set otp=?,otp_created_at=?,updated_at =now() where email = ?`;
    let bindParams = [data.otp, data.otpCreatedAt, where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });

}
const updateUserValidateOtp = async (where) => {
    let query = `update users set otp = null,otp_created_at = null,verified = true  where email = ?`;
    let bindParams = [ where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}
const updateUserStatus = async (where, data) => {
    let query = `update users set status =? where email = ?`;
    let bindParams = [data.status, where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });

}
const updateUserPassword = async (where, data) => {
    let query = `update users set password =? ,token_updated_at=? where email = ?`;
    let bindParams = [data.password, data.token_updated_at, where.where.email];
    console.log(bindParams)
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}



//updateStatus
const updateStatus = async (user_id, status_id) => {
    let query = `update users set status =? where id = uuid_to_bin(?)`;
    let bindParams = [status_id, user_id];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}

const changeUserPassword = async (email, password, tokenUpdatedAt) => {
    let query = `update users set password =? , tokenUpdatedAt =? where email = ?`;
    let bindParams = [password, tokenUpdatedAt, email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}






const updateTokenDate = async (email, tokenUpdatedAt) => {
    let query = ' update users set token_updated_at = ? where email = ? ';
    let bindParams = [tokenUpdatedAt, email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}

const findRole = async(role) =>{
    let query = ' select * from roles r where r.role = ? ';
    let bindParams = [role];
    role = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return role[0];
}

const getAllUsersWhereInId = async(ids) =>{
    let query = ' select * from users u  where u.id in (?) ';
    let bindParams = [ids];
    let users  = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return users;
}


module.exports = {
    signUp,
    updateUserPassword,
    findUser,
    updateUser,
    getAllUsers,
    updateUserOtp,
    updateUserValidateOtp,
    updateUserStatus,
    updateStatus,
    changeUserPassword,
    updateTokenDate,
    findRole,
    getAllUsersWhereInId
};
