const mysql = require("mysql2/promise");
const dbInfo = require("../../../../vp2025config");

//Loome andmebaasiühenduse kogumi - pool
const pool = mysql.createPool({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;