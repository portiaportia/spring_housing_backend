const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = require("mongoose");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

  mongoose
  .connect("mongodb+srv://portiaportia:RCq4HTMF7ZXfeU8O@data.ng58qmq.mongodb.net/")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });

const houseSchema = new mongoose.Schema({
  name:String,
  size:Number,
  bedrooms:Number,
  bathrooms:Number,
  main_images:String
});

const House = mongoose.model("House", houseSchema);

app.get("/",(req, res)=>{
    res.sendFile(__dirname+"/index.html");
});

/*
let houses = [
    {
    "_id":1,
    "name": "Farmhouse",
    "size": 2000,
    "bedrooms": 3,
    "bathrooms": 2.5,
    "features": [
    "wrap around porch",
    "attached garage"
    ],
    "main_image": "farm.webp",
    "floor_plans": [
    {
    "name": "Main Level",
    "image": "farm-floor1.webp"
    },
    {
    "name": "Basement",
    "image": "farm-floor2.webp"
    }
    ]
    },
    {
    "_id":2,
    "name": "Mountain House",
    "size": 1700,
    "bedrooms": 3,
    "bathrooms": 2,
    "features": [
    "grand porch",
    "covered deck"
    ],
    "main_image": "mountain-house.webp",
    "floor_plans": [
    {
    "name": "Main Level",
    "image": "mountain-house1.webp"
    },
    {
    "name": "Optional Lower Level",
    "image": "mountain-house2.webp"
    },
    {
    "name": "Main Level Slab Option",
    "image": "mountain-house3.jpg"
    }
    ]
    },
    {
    "_id":3,
    "name": "Lake House",
    "size": 3000,
    "bedrooms": 4,
    "bathrooms": 3,
    "features": [
    "covered deck",
    "outdoor kitchen",
    "pool house"
    ],
    "main_image": "farm.webp",
    "floor_plans": [
    {
    "name": "Main Level",
    "image": "lake-house1.webp"
    },
    {
    "name": "Lower Level",
    "image": "lake-house2.webp"
    }
    ]
    }
]; */

app.get("/api/houses", async(req, res) => {
  const houses = await House.find();
  res.send(houses);
});

app.post("/api/houses", upload.single("img"), async(req, res) => {
  const result = validateHouse(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    console.log("I have an error");
    return;
  }

  const house = new House({
    name:req.body.name,
    size:req.body.size,
    bedrooms:req.body.bedrooms,
    bathrooms:req.body.bathrooms
  });

  if (req.file) {
    house.main_image = req.file.filename;
  }

 const newHouse = await house.save();

  res.status(200).send(newHouse);
});

app.put("/api/houses/:id", upload.single("img"), async(req, res) => {
  const result = validateHouse(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const fieldsToUpdate = {
    name:req.body.name,
    size:req.body.size,
    bedrooms:req.body.bedrooms,
    bathrooms:req.body.bathrooms
  };

  if (req.file) {
    fieldsToUpdate.main_image = req.file.filename;
  }

  const wentThrough = await House.updateOne({_id:req.params.id}, fieldsToUpdate);

  const house = await House.findOne({_id:req.params.id});

  res.status(200).send(house);
});

app.delete("/api/houses/:id", async(req, res) => {
  const house = await House.findByIdAndDelete(req.params.id);

  res.status(200).send(house);
});

const validateHouse = (house) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    size: Joi.number().required(),
    bedrooms: Joi.number().required(),
    bathrooms: Joi.number().required(),
  });

  return schema.validate(house);
};

app.listen(3001, ()=>{
    console.log("I'm listening");
});