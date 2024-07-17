const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const { param, validationResult } = require('express-validator');


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
  (req, res) => {

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    
    const author = req.params.author;
    const bookList = {};
    
    for( const [key, value] of Object.entries(books)){
      if (value.author === author){
        bookList[key] = value;
      }
    }

    if (Object.keys(bookList).length > 0) {
      return res.status(200).json(bookList);
    } else {
      return res.status(404).json({message: "Author not found"});
    }
  }
  return res.status(422).json({message: errors.array()});
});

// Get all books based on title
public_users.get('/title/:title',
  param('title').notEmpty().escape(),
  (req, res) => {
  
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const title = req.params.title;
    const bookList = {};
    
    for( const [key, value] of Object.entries(books)){
      if (value.title === title){
        bookList[key] = value;
      }
    }

    if (Object.keys(bookList).length > 0) {
      return res.status(200).json(bookList);
    } else {
      return res.status(404).json({message: "Title not found"});
    }
  }
  return res.status(422).json({message: errors.array()});
});

//  Get book review
public_users.get('/review/:isbn',
  param('isbn').notEmpty().escape(),
  (req, res) => {

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const isbn = req.params.isbn;
    
    if (books[isbn]?.reviews) {
      return res.status(200).json(books[isbn].reviews);

    } else if (books[isbn]) {
      return res.status(404).json({ message: "No reviews found" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  }
  return res.status(422).json({message: errors.array()});
});

module.exports.general = public_users;
