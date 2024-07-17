const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const { body,matchedData ,param, validationResult } = require('express-validator');
const authenticatedUser = require("./auth_users.js").authenticatedUser;

const axios = require('axios').default;

const getBookByValue = (filter,value) => {
  return new Promise((resolve, reject) => {

    const bookList = {};
    for (const [key, book] of Object.entries(books)) {
      if (book[filter] === value) {
        bookList[key] = book;
      }
    }

    if (Object.keys(bookList).length > 0) {
      resolve(bookList);
    } else {
      reject({ message: "Author not found" });
    }
  });
}


//register a user
public_users.post("/register",
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


// Get the book list available in the shop
public_users.get('/', async(req, res) => {
  try {
    const { data } = await axios.get("http://localhost:3000/booksdb.json");
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({message: "Internal server error"});
  }

  return res.status(200).json(data);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',
  param('isbn').notEmpty().escape(),
  (req, res) => {
  
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({message: errors.array()});
  }
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ message: "Book not found" });
      }
    })
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      return res.status(404).json(error);
    })
 });
  
// Get book details based on author
public_users.get('/author/:author',
  param('author').notEmpty().escape() ,
  async(req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({message: errors.array()});
  }

  const author = req.params.author;
  try {
    const bookList = await getBookByValue('author',author);
    return res.status(200).json(bookList);
  }
  catch (error) {
    return res.status(404).json({message: "Author not found"});
  }
  
});

// Get all books based on title
public_users.get('/title/:title',
  param('title').notEmpty().escape(),
  async(req, res) => {
  
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({message: errors.array()});
  }

  const title = req.params.title;
  try {
    const bookList = await getBookByValue('title',title);
    return res.status(200).json(bookList);
  }
  catch (error) {
    return res.status(404).json({message: "Title not found"});
  }
});

//  Get book review
public_users.get('/review/:isbn',
  param('isbn').notEmpty().escape(),
  (req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()) {

    return res.status(422).json({message: errors.array()});
  }

  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    
    if (books[isbn]?.reviews) {

      resolve(books[isbn].reviews);
    } else if (books[isbn]) {

      reject({ message: "No reviews found" });
    } else {

      reject({ message: "Book not found" });
    }
  })
  .then((reviews) => {
    return res.status(200).json(reviews);
  })
  .catch((error) => {
    return res.status(404).json(error);
  });
    
  
});

module.exports.general = public_users;
