//importing sequelize library
const mysql = require('mysql2')

//Create pool is a function to create a pool of connections (queries) to SQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: '262800'
})

//exporting the pool with a promise with a structured way
module.exports = pool.promise();