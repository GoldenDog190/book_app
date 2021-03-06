'use strct';

//packages
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

//global varables
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);

//express configs
app.get('/books/:id', showSingleBook);
app.post('/books', newBooks);
app.post('/searches', getBooksData);
app.put('/books/:id', updateBooks);
app.delete('/books/:id', deleteBooks);

app.get('/', (request, response) => {
  client.query('SELECT * FROM books')
  .then(result => {
    console.log(result);
    client.query('SELECT DISTINCT bookshelf FROM books')
    .then(distinct => {
      console.log(distinct.rows);
      response.render('pages/index', {books:result.rows, bookshelfs:distinct.rows});
    })
  })
});

app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new');

});

function updateBooks(request, response){
   const SQL = 'UPDATE books SET author= $1, title=$2,isbn=$3, img_url=$4, description=$5 WHERE id=$6;'
  const values = [request.body.author, request.body.title, request.body.isbn, request.body.img_url, request.body.description, request.params.id];
  client.query(SQL, values)
   .then((result) => {
    response.redirect('/');
  })
}

function deleteBooks(request, response){
  const {id} = request.params;
  const SQL = 'DELETE FROM books WHERE id=$1';
  client.query(SQL, [id])
   .then( () => {
     response.redirect('/');
   });

}

function showSingleBook(request, response){
  console.log(request.params.id);
 client.query('SELECT * FROM books WHERE id=$1', [request.params.id])
 .then(result => {
  client.query('SELECT DISTINCT bookshelf FROM books')
  .then(distinct => {

    console.log(result.rows);
    response.render('pages/books/show', {book:result.rows[0], bookshelf:distinct.rows});
  })
 });
}

function newBooks(request, response){
  console.log(request.body);
  const {author, title, isbn, img_url, description, bookshelf} = request.body;

  const SQL = `INSERT INTO books (author, title, isbn, img_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
  const bookArray = [author, title, isbn, img_url, description, bookshelf];

  client.query(SQL, bookArray)
  .then((result) => {
    console.log('NEW BOOK ID',result);
    response.redirect(`/books/${result.rows[0].id}`);

  })
  .catch((error) => handleError(error, response));
}

function handleError(error, response){
  console.error(error);
  response.render('pages/errors', {error});
}

//route

function getBooksData(request, response){
  //console.log(request.body);
  let searchBody = request.body.search;

  let searchType = request.body.type;
  const urlToBook = `https://www.googleapis.com/books/v1/volumes?q=+in${searchType}:${searchBody}`;


    superagent.get(urlToBook)

      .then(result => {
        const superAgentResult = result.body.items;
        //console.log(result.body);
        const newBookArr = superAgentResult.map(index => {
          return new Books (index);
        })
        response.render('pages/searches/show', {newBookArr : newBookArr});
      })
    .catch(error => {
      // response.status(500).render('pages/error');
      console.log(error);
      response.status(500).send(error);
    });
}

//constructor
function Books (bookJsonData) {
  console.log(bookJsonData.volumeInfo);
this.title = bookJsonData.volumeInfo.title;
this.author = bookJsonData.volumeInfo.authors;
let img_url = bookJsonData.volumeInfo.imageLinks && bookJsonData.volumeInfo.imageLinks.thumbnail ? bookJsonData.volumeInfo.imageLinks. thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
this.img_url = img_url.replace(/^http:\/\//i, 'https://');
this.img_url = img_url;
this.description = bookJsonData.volumeInfo.description;
this.isbn = bookJsonData.volumeInfo.industryIdentifiers[1] ? bookJsonData.volumeInfo.industryIdentifiers[1].industryIdentifiers : '';
}


//start app
client.connect()
.then( () => {
  app.listen(PORT, () => console.log(`running the server on PORT : ${PORT} working`));

})