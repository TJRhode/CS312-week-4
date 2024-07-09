//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://thomasjrhode:Z3ldaSpycr4b@todocluster.jgwykli.mongodb.net/?retryWrites=true&w=majority&appName=TodoCluster/todoDB');

const itemSchema = new mongoose.Schema ({
  name: {
      type: String,
      required: [true, 'NAME REQUIRED']
  }
});

const listSchema = new mongoose.Schema ({
  name: {
      type: String,
      required: [true, 'NAME REQUIRED']
  },
  items: [itemSchema]
});

const Item = mongoose.model("item", itemSchema);

const List = mongoose.model("List", listSchema);

const step1 = new Item ({
  name: "Step1",
});
const step2 = new Item ({
  name: "Step2",
});
const step3 = new Item ({
  name: "Step3",
});
const startingTasks = [step1, step2, step3];



//insert into collection
async function prePopulateTodo(){
  const result = await Item.insertMany(startingTasks);
}

app.get("/", function(req, res) {

  //list db collection
  async function myTodo() {
    const items = await Item.find({});

    if (items.length === 0) {
      console.log("repopulating defaults...")
      prePopulateTodo();
      //res.redirect("/")
    }
    const day = date.getDate();

    res.render("list", {listTitle: "Today", newListItems: items});
  }
  myTodo();

  

});

app.get("/:customListName", function(req, res) {
  
   const customListName = _.capitalize(req.params.customListName);
   console.log("URL:" + customListName);

   async function checkDupes() {
    const existingList = await List.findOne({name: customListName});
    if (existingList) {
      console.log("list: " + customListName + " was found!");
      res.render("list", {listTitle: existingList.name, newListItems: existingList.items});
    }
    else {
      console.log("list: " + customListName + " was not found!");
      const list = new List({
        name: customListName,
        items: startingTasks
       });
    
       list.save();
       res.redirect('/' + customListName);
    }
  }

  checkDupes();
});

//New item added
app.post("/", async(req, res) =>{
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;

  console.log("New item being added: " + req.body.newItem)

  const newTask = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    await newTask.save();
    console.log('item saved')

    res.redirect('/');
  }
  else {
    const existingList = await List.findOne({name: listName});
    if (existingList)
    {
      existingList.items.push(newTask);
      existingList.save();
      res.redirect("/" + listName);
    }
  }
  
  
  }
  catch(err) {
    console.error("error saving item", err);
    res.status(500).send("internal server error");
  }
  
});
//check box ticked
app.post("/delete", async(req, res) =>{
  try {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    console.log("Deleting Item: " + checkedItemId + " from " + listName);

    if (listName === "Today"){
      await Item.deleteOne({ _id: checkedItemId});
      console.log("Item deleted!");

      res.redirect("/");
    }
    
    else {
      const existingList = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}});
      if (existingList){
        res.redirect("/" + listName);
      }

    }
  }
  catch(err) {
    console.error("error deleting item", err);
    res.status(500).send("internal server error");
  }
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
