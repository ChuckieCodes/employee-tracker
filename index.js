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

async function queryDepartments() {
  try {
    const [rows] = await pool.execute(
      'select * from department order by name'
    )
    return rows;
  } catch(err) {
    console.log(`Something went wrong: ${err}`);
  }
}

async function showAllDepartments() {
  console.log(`\nDepartment Table\n`)
  console.table(await queryDepartments())
  init();
}

async function addDepartment() {
  inquirer
    .prompt(
      {
        type: 'input',
        name: 'name',
        message: 'Enter department name: ',
      }
    )
    .then(async function({ name }) {
      try {
        const [result] = await pool.execute('insert into department (name) values (?)', [name]);
        console.log(`\nInsert successful. Added ${name} in department table.\n`);
        init();
      } catch (err) {
        console.log(`Something went wrong: ${err}`);
      }
    })
}

function init() {
  console.log(`\nEmployee Management System\n`);
  
  inquirer
    .prompt({
      type: 'list',
      name: 'task',
      message: 'Would you like to do?',
      choices: [
        'Add Department',
        'Show All Departments',
        'Add Role',
        'Update Role',
        'Show All Roles',
        'Add Employee',
        'Update Employee',
        'Show All Employees',
        'Quit',
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        case 'Add Department':
          addDepartment();
          break;
        case 'Show All Departments':
          showAllDepartments();
          break;
        case 'Quit':
          console.log(`\nbye\n`)
          pool.end();
        break;
      }
    });
}

init();
