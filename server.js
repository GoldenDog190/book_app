'use strct';

//packages
const express = require('express');

//global varables
const app = express();
const PORT = process.env.PORT || 3000;

//express configs
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render();
})

//start app
app.listen(PORT, () => console.log(`running the server on PORT : ${PORT} working`));