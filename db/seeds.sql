INSERT INTO department (name)
VALUES  ("Engineering"),
        ("Operations"),
        ("Human Resources");

INSERT INTO role (title,salary,department_id)
VALUES  ("Tech Lead",200000,1),
        ("COO",200000,2),
        ("Engineer",150000,1),
        ("HR Manager",120000,3);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES  ("John","Smith",1,NULL),
        ("Paolo","Garde",2,NULL),
        ("Tim","Cook",3,1),
        ("Jeff","Bezos",4,NULL);