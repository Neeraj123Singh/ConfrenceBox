const { verify } = require('crypto');
const { sequelize, User, Role } = require('../../models');
const { QueryTypes } = require('sequelize');
var uuid = require('node-uuid');
const { logger } = require('../helpers/logger');


const signUpCEO = async (data) => {
    let query = `insert into users(id,email,name,role,phone,password,payout,bank,createdAt,updatedAt) values(uuid_to_bin(?),?,?,uuid_to_bin(?),?,?,?,?,now(),now()) `
    let bindParams = [uuid.v4(), data.email, data.name, data.role, data.phone, data.password,data.payout,data.bank]
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.INSERT });
    query = `select bin_to_uuid(u.id) as id , u.email as email,u.name as name,u.phone as phone  from users u where email = ?`;
    bindParams = [data.email];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
};

const addUser = async (data) => {
    let query = `insert into users(id,email,name,role,phone,password,otp,otpCreatedAt,parent,createdBy,createdAt,updatedAt) values(uuid_to_bin(?),?,?,uuid_to_bin(?),?,?,?,?,uuid_to_bin(?),uuid_to_bin(?),now(),now()) `
    let bindParams = [uuid.v4(), data.email, data.name, data.role, data.phone, data.password, data.otp, data.otpCreatedAt, data.parent, data.createdBy]
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.INSERT });
    query = `select bin_to_uuid(u.id) as id , u.email as email,u.name as name,u.phone as phone  from users u where email = ?`;
    bindParams = [data.email];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
};

const getAllUsers = async (where, search, offset, limit) => {
    let bindParams = [];
    let query = ' SELECT BIN_TO_UUID(u.id) as id ,u.name as userName,u.payout as payout,u.bank as bank, u.createdAt, u.updatedAt, u.isDeleted as isDeleted,u.status as status,s.name as statusName,u.email as userEmail,u.phone as userPhone,r.role as role ,p.name as parentName, p.email as parentEmail, c.name as creatorName , c.email as creatorEmail  FROM users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c  on u.createdBy = c.id  left join  status s on u.status= s.id ';
    let queryCount = ' SELECT count(*) as totalCount  FROM  users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c on u.createdBy = c.id left join  status s on u.status= s.id';
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
    query += `order by u.createdAt desc `
    if (offset || limit) query += ` limit ${offset},${limit} `;
    let users = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    const totalCount = await sequelize.query(queryCount, { replacements: bindParams, type: QueryTypes.SELECT });
    return { users: users, totalCount: totalCount[0].totalCount };
};

const getUserById = async (id) => {
    let bindParams = [id];
    let query = ' SELECT BIN_TO_UUID(u.id) as id ,u.name as userName,u.isDeleted as isDeleted,u.email as userEmail,u.phone as userPhone,r.role as role ,p.name as parentName, p.email as parentEmail, c.name as creatorName ,u.tokenUpdatedAt as tokenUpdatedAt, c.email as creatorEmail  FROM users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c on u.createdBy = c.id  where u.id = uuid_to_bin(?) ';
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
};

const findUser = async (email) => {
    try {
        let query = ' SELECT BIN_TO_UUID(u.id) as id ,u.otpCreatedAt as otpCreatedAt,u.status as status,s.name as statusName,u.payout as payout,u.bank as bank,u.isDeleted as isDeleted ,u.tokenUpdatedAt as tokenUpdatedAt,u.password as password,u.name as userName,u.email as userEmail,u.otp as otp,u.dummyPassword as dummyPassword,u.phone as userPhone,r.role as role ,p.name as parentName, p.email as parentEmail, c.name as creatorName , c.email as creatorEmail  FROM users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c on u.createdBy = c.id  left join status s on u.status = s.id where u.email=?';
        let bindParams = [email];
        let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });

        // query = 'delete from payouts';
        // user = await sequelize.query(query, { type: QueryTypes.SELECT });

        return user[0];
    } catch (error) {
        console.log(error)
        logger.info(error)
    }
}

const getResetToken = async (id) => {
    let query = ' SELECT BIN_TO_UUID(user_id) as user_id ,reset_token ,created_at from reset_password_link where user_id = uuid_to_bin(?) ';
    let bindParams = [id];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
}


const deleteResetToken = async (id) => {
    let query = ' delete from reset_password_link where user_id = uuid_to_bin(?) ';
    let bindParams = [id];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.DELETE });
    return true;
}

const createResetToken = async (id, token) => {
    let query = ' insert into reset_password_link (user_id,reset_token) values (uuid_to_bin(?),?)';
    let bindParams = [id, token];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.DELETE });
    return true;
}

const findUserById = async (id) => {
    try {
        return await User.findOne({ where: { id: id } });
    } catch (error) {
        logger.info(error)
    }
}
const findRole = async (role) => {
    let query = `select bin_to_uuid(r.id) as id , r.role as role from roles r where role = ?`;
    let bindParams = [role];
    let foundRole = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return foundRole[0];

}
const getRoles = async (role) => {
    let query = `select bin_to_uuid(r.id) as id , r.role as role from roles r `;
    let bindParams = [];
    let roles = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return roles;
}

const updateUser = async (where, data) => {
    let query = `update users set email=?,phone=?,role=uuid_to_bin(?),parent=uuid_to_bin(?),updatedAt =now(),name = ? where email = ?`;
    let bindParams = [data.email, data.phone, data.role, data.parent, data.name, where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
    query = `select bin_to_uuid(u.id) as id , u.email as email,u.name as name,u.phone as phone  from users u where email = ?`;
    bindParams = [data.email];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
}
const updateUserOtp = async (where, data) => {
    let query = `update users set otp=?,otpCreatedAt=?,updatedAt =now() where email = ?`;
    let bindParams = [data.otp, data.otpCreatedAt, where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });

}
const updateUserValidateOtp = async (where, data) => {
    let query = `update users set validatedAt =? where email = ?`;
    let bindParams = [data.otpValidatedAt, where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}
const updateUserDelete = async (where, data) => {
    let query = `update users set isDeleted =? where email = ?`;
    let bindParams = [data.isDeleted, where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });

}
const updateUserPassword = async (where, data) => {
    let query = `update users set password =? , dummyPassword =?,tokenUpdatedAt=? where email = ?`;
    let bindParams = [data.password, data.dummyPassword, data.tokenUpdatedAt, where.where.email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}


const findUserByUserId = async (id) => {
    let query = ' SELECT BIN_TO_UUID(id) as user_id  from users where id = uuid_to_bin(?) ';
    let bindParams = [id];
    let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return user[0];
}

const changePasswordByUserId = async (where, data) => {
    let query = `update users set password =? where id = uuid_to_bin(?)`;
    let bindParams = [data.password, where.where.user_id];
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

const findUserByPhoneOrEmail = async (email, phone) => {
    try {

        let query = ' SELECT BIN_TO_UUID(u.id) as id ,u.otpCreatedAt as otpCreatedAt,u.status as status,s.name as statusName,u.isDeleted as isDeleted ,u.tokenUpdatedAt as tokenUpdatedAt,u.password as password,u.name as userName,u.email as userEmail,u.otp as otp,u.dummyPassword as dummyPassword,u.phone as userPhone,r.role as role ,p.name as parentName, p.email as parentEmail, c.name as creatorName , c.email as creatorEmail  FROM users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c on u.createdBy = c.id  left join status s on u.status = s.id where u.email=? or u.phone=? ';
        let bindParams = [email, phone];
        let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
        return user[0];
    } catch (error) {
        console.log(error)
        logger.info(error)
    }
}

const getParentUsersByRole = async (role) => {
    try {
        const parentRole = findParent(rolesTree, role);
        console.log(role, parentRole)
        let query = ' SELECT BIN_TO_UUID(u.id) as id ,u.otpCreatedAt as otpCreatedAt,u.status as status,s.name as statusName,u.isDeleted as isDeleted ,u.tokenUpdatedAt as tokenUpdatedAt,u.password as password,u.name as userName,u.email as userEmail,u.otp as otp,u.dummyPassword as dummyPassword,u.phone as userPhone,r.role as role ,p.name as parentName, p.email as parentEmail, c.name as creatorName , c.email as creatorEmail  FROM users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c on u.createdBy = c.id  left join status s on u.status = s.id where r.role = ? ';
        let bindParams = [parentRole];
        let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
        return user;
    } catch (error) {
        console.log(error)
        logger.info(error)
    }
}
const getAllUsersWithRolesIn = async (roles) => {
    try {
        let query = ' SELECT BIN_TO_UUID(u.id) as id ,u.otpCreatedAt as otpCreatedAt,u.status as status,s.name as statusName,u.isDeleted as isDeleted ,u.tokenUpdatedAt as tokenUpdatedAt,u.password as password,u.name as userName,u.email as userEmail,u.otp as otp,u.dummyPassword as dummyPassword,u.phone as userPhone,r.role as role ,p.name as parentName, p.email as parentEmail, c.name as creatorName , c.email as creatorEmail  FROM users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c on u.createdBy = c.id  left join status s on u.status = s.id where r.role in (?) ';
        let bindParams = [roles];
        let user = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
        return user;
    } catch (error) {
        console.log(error)
        logger.info(error)
    }
}

const updateTokenDate = async (email, tokenUpdatedAt) => {
    let query = ' update users set tokenUpdatedAt = ? where email = ? ';
    let bindParams = [tokenUpdatedAt, email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}
const updateUserPhone = async (email, phone) => {
    let query = ' update users set phone = ? where email = ? ';
    let bindParams = [phone, email];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}

const getFirstUserByRole = async (role) => {
    let query = ' SELECT BIN_TO_UUID(u.id) as id ,u.status as status,s.name as statusName,u.isDeleted as isDeleted ,u.tokenUpdatedAt as tokenUpdatedAt,u.password as password,u.name as userName,u.email as userEmail,u.otp as otp,u.dummyPassword as dummyPassword,u.phone as userPhone,r.role as role ,p.name as parentName, p.email as parentEmail, c.name as creatorName , c.email as creatorEmail  FROM users u left join roles r on u.role = r.id left join users p on u.parent = p.id left join users c on u.createdBy = c.id  left join status s on u.status = s.id where r.role = ?  ';
    let bindParams = [role];
    let users = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return users[0];
}

const updateBankStatus = async (user_id,status) => {
    let query = ' update users u set bank = ? where id = uuid_to_bin(?) ';
    let bindParams = [status,user_id];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}


const updatePayoutStatus = async (user_id,status) => {
    let query = ' update users u set payout = ? where id = uuid_to_bin(?) ';
    let bindParams = [status,user_id];
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
}
module.exports = {
    signUpCEO,
    findUser,
    findRole,
    updateUser,
    addUser,
    getAllUsers,
    getRoles,
    updateUserOtp,
    updateUserValidateOtp,
    updateUserDelete,
    updateUserPassword,
    getUserById,
    getResetToken,
    deleteResetToken,
    createResetToken,
    updateStatus,
    findUserByUserId,
    changePasswordByUserId,
    changeUserPassword,
    findUserByPhoneOrEmail,
    getParentUsersByRole,
    getAllUsersWithRolesIn,
    updateTokenDate,
    updateUserPhone,
    getFirstUserByRole,
    updateBankStatus,
    updatePayoutStatus
};
