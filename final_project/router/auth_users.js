const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// returns true if username is NOT already in use
const isValid = (username) => {
    const usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length === 0;
};

// returns true if username & password match a stored user
const authenticatedUser = (username, password) => {
    const validUser = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return validUser.length > 0;
};

// only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Both username and password must be provided
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required to login."
        });
    }

    // Check if the user exists and the password matches
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password."
        });
    }

    // Generate a JWT token
    const accessToken = jwt.sign(
        { username: username },  // payload
        "access",                // secret key (must match what you use when verifying)
        { expiresIn: "1h" }      // optional expiry
    );

    // Store token and username in the session
    req.session.authorization = {
        accessToken: accessToken,
        username: username
    };

    return res.status(200).json({
        message: "User successfully logged in.",
        token: accessToken
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;          // book to review
    const review = req.query.review;      // review text comes from query string
    const username = req.session.authorization &&
                     req.session.authorization.username; // logged-in user
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!isbn || !books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }
  
    // Ensure reviews object exists
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    // Add OR modify the review for this user
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({
      message: "Review added/modified successfully",
      reviews: books[isbn].reviews
    });
  });

  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization &&
                     req.session.authorization.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!isbn || !books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    const book = books[isbn];
  
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "No review by this user for this book" });
    }
  
    // Remove ONLY this user’s review
    delete book.reviews[username];
  
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: book.reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
