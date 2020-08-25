'use strct';

//packages
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');

//global varables
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

//express configs
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new');

});

//route
app.post('/searches', getBooksData);

function getBooksData(request, response){
  console.log(request.body);
  let searchBody = request.body.search;

  let searchType = request.body.type;
  const urlToBook = `https://www.googleapis.com/books/v1/volumes?q=+in${searchType}:${searchBody}`;


    superagent.get(urlToBook)

      .then(result => {
        const superAgentResult = result.body.items;
        console.log(result.body);
        const newBookArr = superAgentResult.map(index => {
          return new Books (index);
        })
        response.send(newBookArr);
      })
    .catch(error => {
      response.status(500).render('pages/error');
    });
}

//constructor
function Books (bookJsonData) {
  //console.log(bookJsonData.volumeInfo);
this.title = bookJsonData.volumeInfo.title;
this.author = bookJsonData.volumeInfo.authors;
this.image = bookJsonData.volumeInfo.image;
this.description = bookJsonData.volumeInfo.description;

}

//start app
app.listen(PORT, () => console.log(`running the server on PORT : ${PORT} working`));