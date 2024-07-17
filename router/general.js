const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const { param, validationResult } = require('express-validator');




const getBookByValue = (value) =>
  new Promise((resolve, reject) => {
    const bookList = {};
    for (const [key, book] of Object.entries(books)) {
      if (book[value] === value) {
        bookList[key] = value;
      }
    }

    if (Object.keys(bookList).length > 0) {
      resolve(bookList);
    } else {
      reject({ message: "Author not found" });
    }
  });


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',
  param('isbn').notEmpty().escape(),
  (req, res) => {
  
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const isbn = req.params.isbn;
    
    if (books[isbn]) {
      
      return res.status(200).json(books[isbn]);
    } else {

      return res.status(404).json({message: "Book not found"});
    }
  }
  return res.status(422).json({message: errors.array()});
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
    const bookList = await getBookByValue(author);
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
    const bookList = await getBookByValue(title);
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
