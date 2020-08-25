'use strct';

//packages
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');

//global varables
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static('public'));
//express configs
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new');

});

//route
app.get('/searches', getBooksData);

function getBooksData(request, response){
  let searchTitle = request.query.title;
  let searchAuthor = request.query.author;
  const urlToAuthor = `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${searchAuthor}`;
  const urlToTitle = `https://www.googleapis.com/books/v1/volumes?q=+intitle:${searchTitle}`;


    superagent.get(urlToAuthor, urlToTitle)

      .then(result => {
        const superAgentResult = result.body;
        console.log(result.body);
        const newBookArr = bookJsonData.map(index => {
          return new Books (index);
        })
        response.send(newBookArr);
      })
    .catch(error => {
      response.status(500).send(error.message);
    });
}

//constructor
function Books (bookJsonData) {
this.title = bookJsonData.title;
this.author = bookJsonData.author;
this.image = `https://i.imgur.com/J5LVHEL.jpg`;

}

//start app
app.listen(PORT, () => console.log(`running the server on PORT : ${PORT} working`));