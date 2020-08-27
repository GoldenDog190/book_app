let arrayButtons = document.getElementsByClassName('buttonupdate');
for(let i =0; i < arrayButtons.length; i++){
  arrayButtons[i].addEventListener('click', revealForm);
}

function revealForm(eventObject){
  console.log('button click');
  let arrayForm = document.getElementsByClassName('update');
  for(let i =0; i < arrayForm.length; i++){
    arrayForm[i].setAttribute('style', 'display: block');
  }
}

// function hideDeleteButton(){
//   $('#deletebutton').hide('/', '/searches/new');
//     
//       $('#deletebutton').show('/books/1');
//   

//   };