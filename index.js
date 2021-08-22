const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');
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

const validator = (input) => {
    if (input.length === 0) {
        return 'Please provide an input';
    }
    else {
        return true;
    }
}

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

const addDepartmentQuestion = [
    {
        type:"input",
        message:"What is the name of the department you would like to add?",
        name:"departmentName",
        validate:validator
    }
]

//Function to view all depts
const viewDepartments = () => {
    console.log("Here are all the departments:")
  db.query('SELECT * FROM department', function (err, results) {
    console.table(results)
  });
}
//View all roles
const viewRoles = () => {
    console.log("Here are all the roles:")
  db.query('SELECT * FROM role', function (err, results) {
    console.table(results)
  });
}

const addDepartment = () => {
    inquirer.prompt(addDepartmentQuestion)
        .then((data) => {
            db.query(`INSERT INTO department (name) VALUES (?)`, data.departmentName, (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results);
                console.log("Success, here are all the departments")
                db.query('SELECT * FROM department', function (err, results) {
                    console.table(results)
                })
            })
        })
}

// init function
const init = () => {
    console.log("Welcome to the employee tracker!")
    inquirer.prompt(introQuestions)
    .then((data)=>{
        //switch statement 
        switch (data.intro){
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                viewRoles();
                break;
            case "Add a department":
                addDepartment();
                break;
                // "Add a role",
            // "Add an employee",
            // "Update an employee role",
            case "Exit application":
                console.log("Thank you. Goodbye!")
                process.exit();        
            }
        // console.log(`${data.intro} is being asked`)
    })
    // .then(init)
    .catch((err)=>console.log(err))
}
init()

// styling upon init 

// db.query(`DELETE FROM favorite_books WHERE id = ?`, deletedRow, (err, result) => {
//     if (err) {
//       console.log(err);
//     }
//     console.log(result);
//   });
  
//   // Query database
//   db.query('SELECT * FROM favorite_books', function (err, results) {
//     console.log(results);
//   });


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
