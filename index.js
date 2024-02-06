const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
require('console.table');

// Create the connection to database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'employee_db',
  connectionLimit: 10,
});
