const inquirer = require("inquirer");
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    console.log(`Connected to the books_db database.`)
  );

// const validator = (input) => {
//     if (input.length === 0) {
//         return 'Please provide an input';
//     }
//     else {
//         return true;
//     }
// }

// const numValidator = (input) => {
//     if (isNaN(input)) {
//         return "please enter a number";
//     }
//     return true;
// }

const introQuestions = [
    {
        type: "list",
        message: "What would you like to do?",
        name: "intro",
        choices: [
            "View all departments",
            "View all roles",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Exit application"
        ]
    }
]

// init function
const init = () => {
    console.log("Welcome to the employee tracker!")
    inquirer.prompt(introQuestions)
    .then((data)=>{
        console.log(`${data.intro} is being asked`)
    })
    .catch((err)=>console.log(err))
}
init()

// styling upon init 

// Inquirer list with the following options
    // View all departments
    // View all roles
    // Add a department 
    // Add a role
    // Add an employee 
    // Update an employee role
    // End application

// When I choose view all departments
// Then a table with department names and dept IDs

// When I view all roles 
// Then a table with job title, role id, departments, salary

// When I choose to view all employees
// Then employee data: emp ID, first name, last name, job title, dept, salary, manager

// When I add a department
// Enter name of dept 
// Create a value in department table 

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
