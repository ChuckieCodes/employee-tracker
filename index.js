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

async function queryRoles() {
  try {
    const [rows] = await pool.execute(
      'select r.*, d.name department_name from role r left join department d on d.id = r.department_id'
    )
    return rows;
  } catch(err) {
    console.log(`Something went wrong: ${err}`);
  }
}

async function queryEmployees() {
  try {
    const [rows] = await pool.execute(
      `select 
        e.id,
        concat(e.first_name, ' ', e.last_name) full_name,
        ifnull((select concat(first_name, ' ', last_name) from employee where id = e.manager_id), 'no manager') manager, 
        r.title, 
        r.salary 
      from 
        employee e 
      left join 
        role r on r.id = e.role_id`
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

async function showAllRoles() {
  console.log(`\nRole Table\n`)
  console.table(await queryRoles())
  init()
}

async function showAllEmployees() {
  console.log(`\nEmployee Table\n`)
  console.table(await queryEmployees())
  init()
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

async function addRole() {
  const dChoicesRows = await queryDepartments();
  const dChoices = dChoicesRows.map(row => ({ value: row.id, name: row.name }));

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter role title: ',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter salary: ',
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Choose department: ',
        choices: dChoices
      }
    ])
    .then(async function({ departmentId, name, salary }) {
      try {
        const [result] = await pool.execute('insert into role (department_id, title, salary) values (?, ?, ?)', [departmentId, name, salary]);
        console.log(`\nInsert successful. Added ${name} in role table.\n`);
        init();
      } catch (err) {
        console.log(`Something went wrong: ${err}`);
      }
    })
}

async function addEmployee() {
  const rChoiceRows = await queryRoles();
  const rChoices = rChoiceRows.map(row => ({ value: row.id, name: row.title }));

  const eChoiceRows = await queryEmployees();
  let eChoices = eChoiceRows.map(row => ({ value: row.id, name: row.full_name }));

  // check if first employee
  eChoices.unshift({value: null, name: 'No Manager'});

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter employee first name: ',
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter employee last name: ',
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Choose role: ',
        choices: rChoices
      },
      {
        type: 'list',
        name: 'managerId',
        message: 'Choose manager: ',
        choices: eChoices
      }
    ])
    .then(async function({ roleId, managerId, firstName, lastName }) {
      try {
        const [result] = await pool.execute('insert into employee (role_id, manager_id, first_name, last_name) values (?, ?, ?, ?)', [roleId, managerId, firstName, lastName]);
        console.log(`\nInsert successful. Added ${firstName} ${lastName} in employee table.\n`);
        init();
      } catch (err) {
        console.log(`Something went wrong: ${err}`);
      }
    })
}

async function updateRole() {
  const rChoiceRows = await queryRoles();
  const rChoices = rChoiceRows.map(row => ({ value: row.id, name: row.title }));

  inquirer
    .prompt(
      {
        type: 'list',
        name: 'roleId',
        message: 'Choose role you want to update: ',
        choices: rChoices
      }
    )
    .then(async function({ roleId }) {
      const dChoicesRows = await queryDepartments();
      const dChoices = dChoicesRows.map(row => ({ value: row.id, name: row.name }));

      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Enter role title: ',
          },
          {
            type: 'input',
            name: 'salary',
            message: 'Enter salary: ',
          },
          {
            type: 'list',
            name: 'departmentId',
            message: 'Choose department: ',
            choices: dChoices
          }
        ])
        .then(async function({ departmentId, name, salary }) {
          try {
            const [result] = await pool.execute('update role set department_id = ?, title = ?, salary = ? where id = ?', [departmentId, name, salary, roleId ]);
            console.log(`\nUpdate successful. Updated ${name} in role table.\n`);
            init();
          } catch (err) {
            console.log(`Something went wrong: ${err}`);
          }
        })
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
        case 'Add Role':
          addRole();
          break;
        case 'Update Role':
          updateRole();
          break;
        case 'Show All Roles':
          showAllRoles();
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Update Employee':
          updateEmployee();
          break;
        case 'Show All Employees':
          showAllEmployees();
          break;
        case 'Quit':
          console.log(`\nbye\n`)
          pool.end();
        break;
      }
    });
}

init();
