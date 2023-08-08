// app.js
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const connection = require("./connection");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => res.json({ message: 'Hello World!' }));
app.get('/bookmarks/:id', (req, res) => {
    const bookmarkId = req.params.id;
  
    connection.query('SELECT * FROM bookmark WHERE id = ?', [bookmarkId], (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Bookmark not found' });
        return;
      }
      const bookmark = results[0];
      res.status(200).json(bookmark);
    });
  });

app.post('/bookmarks', (req, res) => {
  const { url, title } = req.body;
  if (!url || !title) {
    return res.status(422).json({ error: 'required field(s) missing' });
  }
  connection.query('INSERT INTO bookmark SET ?', req.body, (err, stats) => {
    if (err) return res.status(500).json({ error: err.message, sql: err.sql });

    connection.query('SELECT * FROM bookmark WHERE id = ?', stats.insertId, (err, records) => {
      if (err) return res.status(500).json({ error: err.message, sql: err.sql });
      return res.status(201).json(records[0]);
    });
  });
});

module.exports = app;
