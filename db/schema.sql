DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  title VARCHAR(30),
  salary DECIMAL(10,2),

  FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  manager_id INT NULL,
  first_name VARCHAR(30),
  last_name VARCHAR(30),

  FOREIGN KEY (role_id) REFERENCES role(id)
);
