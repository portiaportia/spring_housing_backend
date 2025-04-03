const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

app.get("/",(req, res)=>{
    res.sendFile(__dirname+"/index.html");
});

let houses = [
    {name:"Farmhouse"},
    {name:"Cool House"}
];

app.listen(3001, ()=>{
    console.log("I'm listening");
});