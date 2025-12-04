const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/* =========================
   USER REGISTRATION (Task 6)
   ========================= */

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Both username and password are required
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required."
        });
    }

    // Check if username is already taken (uses isValid from auth_users.js)
    if (!isValid(username)) {
        return res.status(409).json({
            message: "User already exists."
        });
    }

    // Store the user in the shared users array
    users.push({
        username: username,
        password: password
    });

    return res.status(201).json({
        message: "User successfully registered."
    });
});


/* =========================================
   PROMISE HELPERS (for Tasks 10–13)
   ========================================= */

// Task 10: Get ALL books using a Promise
function getAllBooksAsync() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

// Task 11: Get book BY ISBN using a Promise
function getBookByIsbnAsync(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve({ isbn: isbn, ...book });
        } else {
            reject("Book not found");
        }
    });
}

// Task 12: Get books BY AUTHOR using a Promise
function getBooksByAuthorAsync(author) {
    return new Promise((resolve, reject) => {
        const matchingBooks = [];

        for (let isbn in books) {
            if (books[isbn].author === author) {
                matchingBooks.push({
                    isbn: isbn,
                    ...books[isbn]
                });
            }
        }

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(`No books found for author: ${author}`);
        }
    });
}

// Task 13: Get books BY TITLE using a Promise
function getBooksByTitleAsync(title) {
    return new Promise((resolve, reject) => {
        const matchingBooks = [];

        for (let isbn in books) {
            if (books[isbn].title === title) {
                matchingBooks.push({
                    isbn: isbn,
                    ...books[isbn]
                });
            }
        }

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(`No books found with the title: ${title}`);
        }
    });
}


/* =========================================
   ROUTES (Tasks 1–5 implemented with Promises for 10–13)
   ========================================= */

// Task 1 + Task 10: Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await getAllBooksAsync();
        return res.send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        console.error("Error getting books:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Task 2 + Task 11: Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const bookData = await getBookByIsbnAsync(isbn);
        return res.status(200).json(bookData);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Task 3 + Task 12: Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const matchingBooks = await getBooksByAuthorAsync(author);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Task 4 + Task 13: Get book details based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const matchingBooks = await getBooksByTitleAsync(title);
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Task 5: Get book review (doesn't need Promises)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
