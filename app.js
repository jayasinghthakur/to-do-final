//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const port = process.env.PORT || 5000;


const app = express();

mongoose.connect(process.env.MONGO_URL);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

const itemsSchema=new mongoose.Schema({
    name: String,
});

const listSchema=new mongoose.Schema({
   name:String,
   items:[itemsSchema]
})

const List = mongoose.model("List", listSchema);

const Items=mongoose.model("Items",itemsSchema);

const item1= new Items({
     name : "buy"
});
const item2= new Items({
  name : "clean"
});
const item3= new Items({
  name : "yoga"
});

const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {

  async function finditems(){
    const Itemss =await Items.find({});
    if (Itemss.length===0){
      try {
        Items.insertMany( defaultItems);
      } catch (e) {
         console.log(e);
      }
      res.redirect("/");
    }
    else{
    res.render("list", {listTitle: "Today", newListItems: Itemss});
    }
  }
    finditems();
});

app.post("/", async function(req, res){

  const itemName= req.body.newItem;
  const listName=req.body.list;
  
  const itemm= new Items({
    name : itemName

  });

  if (listName==="Today"){
    itemm.save();
    res.redirect("/");
  }
  else{
      try {
      const foundList1=await List.findOne({name:listName});
    foundList1.items.push(itemm);
    foundList1.save();
    res.redirect("/" + listName);
      } catch (error) {
        console.log(error)
      }
    }
  
});

app.post("/delete",async function(req,res){
    const removeid=req.body.checkbox;
    const listName=req.body.listName;

    if (listName==="Today"){
    try {
      await Items.findByIdAndRemove(removeid);
    } catch (error) {
      console.log(error);
    }
    res.redirect("/");
   }
   else{
    try {
      await List.findOneAndUpdate({name:listName},{$pull : {items : {_id : removeid}}})
      res.redirect("/"+ listName);
    } catch (error) {
      console.log(error);
    }

   }
}) 

app.get("/:getCustomName" , function (req,res){
  const cusName=_.capitalize(req.params.getCustomName);
  async function existOrnot(){
  const foundList=await List.findOne({name:cusName})
  try{
    if(!foundList){
      const list=new List({
        name:cusName,
        items:defaultItems
      })
      list.save();
    res.redirect("/"+ cusName ) ; 
    }

    else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
  }
  catch(error){
     console.log(error);
  }
}
  existOrnot();

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port , function() {
  console.log("Server started on port 3000");
});
