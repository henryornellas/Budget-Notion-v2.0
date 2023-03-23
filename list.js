//This server passes data from webpage to server and back with EJS.

//Requesting modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();


//EJS, Body Parser, Express and mongoose modules setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
mongoose.connect('mongodb+srv://Admin-henry:test123@cluster0.wxhlcjm.mongodb.net/notionDB', {useNewUrlParser: true});


//Set itemsSchema and listSchema
const itemsSchema = {
  name: String
};
const Item = mongoose.model('item', itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model('List', listSchema);


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
      }).catch(function(err){
        console.log(err);
      });
      res.redirect('/');
    }else{
      res.render('list', {listTitle: 'Today', newListItems: foundItems});
    }
  });

});


//Submit button adds new item to default list, or custom one
app.post('/', async function(req, res){

  const taskName = req.body.newTask;
  const listName = req.body.list;

  const item = new Item ({
    name: taskName
  });

  if(listName === 'Today'){
    item.save();
    res.redirect('/');
  }else {
    try{
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect('/'+ listName);
    }catch(err){
      console.log(err);
    }
  }

});


//Checkbox triggers /delete route, that removes the item with corresponding ID.
app.post('/delete', async function(req, res){

  const checkedItem = req.body.checked;
  const listName = req.body.listName;

  if(listName === 'Today'){
    try {
      const deleted = await Item.findByIdAndRemove(checkedItem);
      console.log('DELETED!');
      res.redirect('/');
    }catch(err){
      console.log(err);
    }
  }else{
    try {
      const deleted = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}});
      res.redirect('/'+listName);
    }catch(err){
      console.log(err);
    }
  }


});


//Render different list name when client requests custom path.
app.get('/:customListName', async function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({name: customListName});
    if(foundList === null){
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect('/' + customListName);
    }else{
      //Show existing list
      res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
    }
  }catch(err){
    console.log(err);
  }

});




//Server port.
app.listen(process.env.PORT || 3000, function(){
  console.log('WORKING');
});
