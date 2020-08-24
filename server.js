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
})


//start app
app.listen(PORT, () => console.log(`running the server on PORT : ${PORT} working`));