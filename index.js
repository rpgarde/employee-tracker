const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();
const util = require("util");
// const { POINT_CONVERSION_COMPRESSED } = require("constants");
const Font = require('ascii-art-font');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log(`Connected to the employees_db database.`)
);

db.query = util.promisify(db.query);

const validator = (input) => {
    if (input.length === 0) {
        return 'Please provide an input';
    }
    else {
        return true;
    }
}

const numValidator = (input) => {
    if (isNaN(input)) {
        return "please enter a number";
    }
    return true;
}

const introQuestions = [
    {
        type: "list",
        message: "What would you like to do?",
        name: "intro",
        choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Exit application"
        ]
    }
]

const addDepartmentQuestion = [
    {
        type: "input",
        message: "What is the name of the department you would like to add?",
        name: "departmentName",
        validate: validator
    }
]

// Array builders for choices
const departmentArray = () => {
    return db.query('SELECT DISTINCT name from department')
}

const roleArray = () => {
    return db.query('SELECT DISTINCT title from role')
}

const managerArray = () => {
    return db.query('SELECT CONCAT(first_name," ",last_name) as manager_name from employee')
}

const employeeArray = () => {
    return db.query('SELECT CONCAT(first_name," ",last_name) as name, id from employee')
}

//Function to view all depts
const viewDepartments = () => {
    console.log("Here are all the departments:")
    db.query('SELECT * FROM department', function (err, results) {
        console.table(results);
        setTimeout(initQuestions,1000);
    });
}

//View all rolesTHEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
const viewRoles = () => {
    console.log("Here are all the roles:")
    db.query(`SELECT r.title,r.id as role_id,d.name as department,salary 
        FROM role r
        JOIN department d ON r.department_id = d.id`, function (err, results) {
        console.table(results);
        setTimeout(initQuestions,1000);
    });
}

//View all employees
const viewEmployees = () => {
    console.log("Here are all the employees:")
    db.query(
        `SELECT 
      e.ID as employee_id,
      e.first_name,
      e.last_name,
      r.title as job_title,
      d.name as department,
      salary,
      CONCAT(m.first_name," ",m.last_name) as manager

      FROM 
      employee e 
      JOIN role r ON e.role_id = r.id 
      JOIN department d ON r.department_id = d.id 
      LEFT JOIN employee m ON e.manager_id = m.id 
      `, function (err, results) {
        console.table(results)
        initQuestions(); 
    })
}

//Add departments
const addDepartment = async () => {
    await inquirer.prompt(addDepartmentQuestion)
        .then(async (data) => {
            await db.query(`INSERT INTO department (name) VALUES (?)`, data.departmentName)
                .then((results) => {
                    console.log(`You have successfully added ${data.departmentName}`)
                })
            })
    setTimeout(initQuestions(), 1000);
} 

async function addRole() {
    const addRoleQuestions = [
        {
            type: "input",
            message: "What is the name of the role you would like to add?",
            name: "roleName",
            validate: validator
        },
        {
            type: "list",
            message: "What department does this role belong to?",
            name: "departmentName",
            choices: await departmentArray()
        },
        {
            type: "input",
            message: "What is the salary for this role?",
            name: "salary",
            validate: numValidator
        }
    ]
    inquirer.prompt(addRoleQuestions)
        .then(async (data) => {
            const { roleName, departmentName, salary } = data
            await db.query(`INSERT INTO role (title,salary,department_id) 
                SELECT ?,?,id FROM department WHERE name = ?;`, [roleName, salary, departmentName])
                .then((results) => console.log(`You have successfully added ${roleName} to ${departmentName}`))
                .catch((err) => console.log(err))
            setTimeout(initQuestions,1000);
        })
}

async function addEmployee() {
    let roleArr = await roleArray()
    roleArr = roleArr.map(i => i.title)
    let managerArr = await managerArray()
    managerArr = managerArr.map(j => j.manager_name)
    const addEmployeeQuestions = [
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "firstName",
            validate: validator
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "lastName",
            validate: validator
        },
        {
            type: "list",
            message: "What is the employee's role?",
            name: "roleName",
            choices: roleArr
        },
        {
            type: "list",
            message: "Who is the employee's manager?",
            name: "managerName",
            choices: [...managerArr,'No manager']
        },
    ]
    inquirer.prompt(addEmployeeQuestions)
        .then(async (data) => {
            console.log(data)
            const { firstName, lastName, roleName, managerName } = data
            var managerId = undefined
            // get manager's employee ID based on their name
            await db.query('SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = ?',managerName)
                .then((results)=>{
                    if(managerName === "No manager"){
                        return
                    }
                    managerId = results[0].id
                })
                .catch((err)=>console.log(err))
            // add a new row in employee based on the collected data
            await db.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) SELECT ?,?,id,? FROM role WHERE title = ?;`,
                [firstName, lastName, managerId, roleName])
                .then((results)=>console.log(`Successfully added ${firstName} ${lastName} with manager ${managerName}`))
                .catch((err)=>console.log(err))
            setTimeout(initQuestions,1000);
        })
}

async function updateEmployeeRole() {
    let employeeArr = await employeeArray()
    let roleArr = await roleArray()
    roleArr = roleArr.map(i => i.title)
    const updateEmployeeRoleQuestions = [
        {
            type: "list",
            message: "Which employee would you like to modify?",
            name: "employeeName",
            choices: employeeArr
        },
        {
            type: "list",
            message: "What role would you like to change to?",
            name: "roleName",
            choices: roleArr
        }
    ]
    inquirer.prompt(updateEmployeeRoleQuestions)
        .then(async (data) => {
            const { employeeName, roleName } = data
            //UPDATE
            var roleId = undefined
            await db.query('SELECT id FROM role WHERE title = ?',roleName)
            .then((results)=>{
                roleId = results[0].id
            })
            .catch((err)=>console.log(err))
            await db.query(`UPDATE employee SET role_id = ? WHERE CONCAT(first_name," ",last_name) = ?`,[roleId,employeeName])
            .then((results)=>{
                console.log(`Successfuly updated ${employeeName}'s role to ${roleName}`)
            })
            .catch((err)=>console.log(err))
        setTimeout(initQuestions,1000);
        })
}

const initQuestions = () => {
    inquirer.prompt(introQuestions)
        .then((data) => {
            //switch statement 
            switch (data.intro) {
                case "View all departments":
                    viewDepartments();
                    break;
                case "View all roles":
                    viewRoles();
                    break;
                case "View all employees":
                    viewEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                case "Exit application":
                    console.log("Thank you. Goodbye!")
                    process.exit();
            }
        })
        .catch((err) => console.log(err))
}

// init function
const init = () => {
    Font.create('Employee Tracker', 'Doom', (err, result) => {
        if (err) throw err;
        console.log(result);
        setTimeout(initQuestions,500);
    })
}

init()
