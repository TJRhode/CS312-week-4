//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todoDB');

const itemSchema = new mongoose.Schema ({
  name: {
      type: String,
      required: [true, 'NAME REQUIRED']
  },
});

const Item = mongoose.model("item", itemSchema);

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
      res.redirect("/")
    }

    res.render("list", {listTitle: "today", newListItems: items});
  }
  myTodo();

  const day = date.getDate();

  

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
