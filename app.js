//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<username>:<password>@cluster0.gxbln23.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "test1"
});

const item2 = new Item({
  name: "test2"
});

const defaultitems = [item1, item2];

const categorySchema = {
  name : String,
  items: [itemSchema]
};
const List = new mongoose.model("List", categorySchema);
const day = date.getDate();

app.get("/", function(req, res) {


Item.find({}, function (err, founditems) {
  if(founditems.length === 0){
    Item.insertMany(defaultitems, function (err) {
      if(err){
        console.log(err);
      }
      else{
        console.log("successfully added");
      }
    });
    res.redirect("/")
  }
  else {
    console.log("already added!!");
    res.render("list", {listTitle: day, newListItems: founditems});
  }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  const item = new Item({
    name : itemName
  });

  if(listTitle === day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listTitle}, function (err, founditems){
      founditems.items.push(item);
      founditems.save();
      res.redirect("/" + listTitle);
    })
  }

});

app.post("/delete", function (req,res) {
   const id = req.body.checkbox;
   const title = req.body.Listcat;
   if(title === day){
   Item.findByIdAndDelete(id, function(err) {
    if(err){
      console.log(err);
    }
    else{
      console.log("Item deleted");
    }
   });
   res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: title}, {$pull: {items: {_id: id}}}, function(err,result) {
      if(err){
        console.log(err);
      }
       else{
        console.log("updated successfully");
        res.redirect("/" + title);
       }
    })
  }
})

app.get("/:categoryname", function(req,res){
  const ctname = _.capitalize(req.params.categoryname);
  
  List.findOne({name: ctname}, function(err, founditems){
    if(!err){
      if(founditems){
        res.render("list", {listTitle: ctname, newListItems: founditems.items});
      }
      else{
        const list = new List({
          name: ctname,
          items:[]
        });
        list.save();
        console.log("inserted!!");
        res.redirect("/" + ctname);
      }
    }
    else{
      console.log(err);
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000 || process.env.PORT, function() {
  console.log("Server started on port 3000");
});
