const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();
const util = require("util");

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log(`Connected to the books_db database.`)
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

const departmentArray = () => {
    return db.query('SELECT DISTINCT name from department')
}

const roleArray = () => {
    return db.query('SELECT DISTINCT title from role')
}

const managerArray = () => {
    return db.query('SELECT CONCAT(first_name," ",last_name) as manager_name from employee')
}

//Function to view all depts
const viewDepartments = () => {
    console.log("Here are all the departments:")
    db.query('SELECT * FROM department', function (err, results) {
        if(err){
            console.log(err)
        }
        return results
    });
}

//View all rolesTHEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role

const viewRoles = () => {
    console.log("Here are all the roles:")
    db.query(`SELECT r.title,r.id as role_id,d.name as department,salary 
        FROM role r
        JOIN department d ON r.department_id = d.id`, function (err, results) {
        console.table(results)
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
    });
}

//Add departments
const addDepartment = () => {
    inquirer.prompt(addDepartmentQuestion)
        .then((data) => {
            db.query(`INSERT INTO department (name) VALUES (?)`, data.departmentName, (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results);
                console.log("Success!");
                viewDepartments();
            })
        })
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
            db.query(`INSERT INTO role (title,salary,department_id) 
                SELECT ?,?,id FROM department WHERE name = ?;`, [roleName, salary, departmentName], (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results);
                console.log("Success!");
                viewRoles();
            })
        })
}

async function addEmployee() {
    let roleArr = await roleArray()
    roleArr = roleArr.map(i => i.title)
    let managerArr = await managerArray()
    managerArr = managerArr.map(j => j.manager_name)
    console.log(managerArr)
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
            await db.query('SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = ?',managerName)
                .then((results)=>{
                    if(managerName === "No manager"){
                        return
                    }
                    managerId = results[0].id
                })
                .catch((err)=>console.log(err))
            await db.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) SELECT ?,?,id,? FROM role WHERE title = ?;`,
                [firstName, lastName, managerId, roleName])
                .then((results)=>console.log(`Successfully added ${firstName} ${lastName} with manager ${managerName}`))
                .catch((err)=>console.log(err))
            viewEmployees();
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
                // "Update an employee role",
                case "Exit application":
                    console.log("Thank you. Goodbye!")
                    process.exit();
            }
            // console.log(`${data.intro} is being asked`)
        })
        .catch((err) => console.log(err))
}

// init function
const init = () => {
    console.log("Welcome to the employee tracker!")
    initQuestions()
}
init()

// styling upon init 

// When I add a role 
// Enter role name
// Enter salary (numbers)
// Enter department ()


// When I add an employee
// Enter first name, last name, role, and manager

// When I update an employee role 
// Pull all employees and place into a list 
// Once I select employee
// Pull all available roles 
// Once I select available roles 
// Update database 
