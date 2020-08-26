'use strct';

//packages
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');

//global varables
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);

//express configs
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  client.query('SELECT * FROM books')
  .then(result => {
    console.log(result);
    response.render('pages/index', {books:result.rows});
  })
});

app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new');

});

app.get('/books/:id', showSingleBook);
function showSingleBook(request, response){
 client.query('SELECT * FROM books WHERE id=$1', [request.params.id])
 .then(result => {
   response.render('pages/books/show', {book:result.rows[0]});
 });
}

app.post('/books', addBookForm);
function addBookForm(request, response){
  response.render('pages/books/show');
}

app.get('/books', newBooks)
function newBooks(request, response){
  console.log(request.body);
  const {author, title, isbn, img_url, description} = request.body;

  const SQL = `INSERT INTO books (author, title, isbn, img_url, description) VALUES ($1, $2, $3, $4, $5)`;
  const bookArray = [author, title, isbn, img_url, description];

  client.query(SQL, bookArray).then(() => {
    throw new Error('error');
    response.redirect('/books');
  }).catch((error) => handleError(error, response));

}

function handleError(error, response){
  console.error(error);
  response.render('pages/errors', {error});
}

//route
app.post('/searches', getBooksData);

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