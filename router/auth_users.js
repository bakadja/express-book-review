const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const { body,matchedData ,validationResult } = require("express-validator");


let users = [];


const authenticatedUser = (username,password)=>{ 
    return users.find(user => user.username === username && user.password === password) ;
}

//register a user
regd_users.post("/register",
  [
    body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({min: 3})
    .withMessage("Username must be at least 3 characters long")
    .trim() 
    .notEmpty()
    .escape(),
    body("password")
    .isStrongPassword()
    .withMessage("Password must be at least 8 characters long, contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character")
    .trim()
    .notEmpty()
    .escape()
  ],
  (req,res) => {
  
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    
    const data = matchedData(req);
    const {username, password} = data;

    if(authenticatedUser(username, password)){
      return res.status(400).json({message: "Username already exists"});
    } else {
      users.push(data);
      return res.status(200).json({message: "User registered successfully"});
    }
  }
  return res.status(422).json({message: errors.array()});
});

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.users = users;
