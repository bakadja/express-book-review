const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const { body,param,matchedData ,validationResult } = require("express-validator");


let users = [];

const authenticatedUser = (username,password)=>{ 
    return users.find(user => user.username === username && user.password === password) ;
}



//only registered users can login
regd_users.post("/login",
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
        try {
          // create a token
          const token = jwt.sign({username: username}, process.env.JWT_SECRET, {expiresIn: "1h"});
          req.session.authorization = {accessToken: token};

          return res.status(200).json({message: "User logged in successfully"});
          
        } catch (error) {
          return res.status(500).json({message: "Internal server error"});
        }
      } else {
        return res.status(400).json({message: "Invalid username or password"});
      }
    }
    return res.status(422).json({message: errors.array()});
});

// Add a book review
regd_users.put("/auth/review/:isbn",
  param("isbn")
  .notEmpty()
  .escape(),
  [
    
    body("username")
    .isString()
    .withMessage("Name must be a string")
    .isLength({min: 3})
    .withMessage("Name must be at least 3 characters long")
    .trim()
    .notEmpty()
    .escape(),
    body("review")
    .isString()
    .withMessage("Review must be a string")
    .isLength({min: 3})
    .withMessage("Review must be at least 3 characters long")
    .trim() 
    .notEmpty()
    .escape()
  ], 
  (req, res) => {
  
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({message: errors.array()});
  }
  // const isbn = req.params.isbn;
  const data = matchedData(req);
  console.log("data",data);

  const {isbn, username, review} = data;

  const foundUser = users.find(user => user.username === username);

  if(!foundUser) {
    return res.status(400).json({message: "User not found"});
  }
  console.log("foundUser",foundUser);
  console.log("review",books[isbn].reviews[username]);

  if(books[isbn] && foundUser.username) {
    if(books[isbn].reviews[foundUser.username]) {
      
    books[isbn].reviews[username] = {
      ...books[isbn].reviews[username], review: review
    }
    console.log("Review updated")  
    console.log("test",books[isbn].reviews[username]);

    return res.status(200).json({message: "Review updated successfully"});
      // return res.status(400).json({message: "User already reviewed this book"});
    }
    books[isbn].reviews = {
      ...books[isbn].reviews, [username]: {review: review}
    };
  console.log("add review", books[isbn].reviews);
  console.log("review",books[isbn]);
    
    return res.status(200).json({message: "Review added successfully"});

  }
  else
  {
    return res.status(404).json({message: "Book not found"});
  }

});

module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
