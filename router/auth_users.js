const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const { body,param,matchedData ,validationResult } = require("express-validator");


let users = [];

const authenticatedUser = (username,password)=>{ 
    return users.find(user => user.username === username && user.password === password) ;
}

const reviewService = {
  addOrUpdateReview: async(isbn, username, review) => {
    return new Promise((resolve) => {
    if(books[isbn]) {

      // udpate review if user already reviewed the book
      if(books[isbn].reviews[username]) {
        
      books[isbn].reviews[username] = {
        ...books[isbn].reviews[username], review: review
      }
      console.log("update review",books);
      resolve({message: "Review updated successfully"});
      }

      // add new review if user has not reviewed the book
      books[isbn].reviews = {
        ...books[isbn].reviews, [username]: {review: review}
      };
      console.log("add new review", books[isbn]);
      resolve({message: "Review added successfully"});
    }
    });
  },

  findUser: async(username) => {
    return new Promise((resolve, reject) => {
      const foundUser = users.find(user => user.username === username);
      if(foundUser) {
        resolve(foundUser);
      }
      else {
        reject({message: "User not found"});
      }
    });
  },

  findBook: async(isbn) => {
    return new Promise((resolve, reject) => {
      if(books[isbn]) {
        resolve(books[isbn]);
      }
      else {
        reject({message: "Book not found"});
      }
    });
  }
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
  async(req, res) => {
  
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({message: errors.array()});
  }

  const data = matchedData(req);
  const {isbn, username, review} = data;
  
  try {
    
    const foundUser = await reviewService.findUser(username);
    if(!foundUser) {
      return res.status(400).json({message: "User not found"});
    }

    const book = await reviewService.findBook(isbn);
    if(!book) {
      return res.status(400).json({message: "Book not found"});
    }

    const result = await reviewService.addOrUpdateReview(isbn, username, review);
    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({message: error.message});
  }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
