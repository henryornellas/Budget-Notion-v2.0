//This server passes data from webpage to server and back with EJS.

//Requesting modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();


//EJS, Body Parser, Express and mongoose modules setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
mongoose.connect('mongodb://127.0.0.1:27017/notionDB', {useNewUrlParser: true});


//Set new schema for DB
const itemsSchema = {
  name: String
};

const Item = mongoose.model('item', itemsSchema);


//Default starter items
const item1 = new Item ({
  name: 'Buy blinker fluid'
});
const item2 = new Item ({
  name: 'Take fish for a walk'
});

const defaultItems = [item1, item2];


//Checks if items collection is empty to add starter items
app.get('/', function(req, res){

  Item.find({}).then(function(foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log('Successfully saved');
      }).catch(function(err){
        console.log(err);
      });
      res.redirect('/');
    }else{
      res.render('list', {listTitle: 'Today', newListItems: foundItems});
    }
  });

});


//Submit button action adds new item to collection
app.post('/', function(req, res){

  const taskName = req.body.newTask

  const item = new Item ({
    name: taskName
  });
  item.save();

  res.redirect('/');
});



app.post('/delete', async function(req, res){

  const checkedItem = req.body.checked;

  try {
    const deleted = await Item.findByIdAndRemove(checkedItem);
    console.log('DELETADO!');
    res.redirect('/');
  }catch(err){
    console.log(err);
  }

});


//Render different list name when client requests /work.
app.get('/work', function(req, res){
  res.render('list', {listTitle: 'Work List', newListItems: workItems});
});




//Server port.
app.listen(process.env.PORT || 3000, function(){
  console.log('WORKING');
});
