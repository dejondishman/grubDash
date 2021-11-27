const path = require("path");


// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


//Riuter funtion thatt list all dishes
function list(req,res) {
    res.json({data: dishes});
}

//a middleWare function that check if the dish exist

const  dishExists = (req, res, next) => {
  const {dishId} = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if(foundDish) {
      res.locals.dish = foundDish;
      return
  }
  next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
  });
}

const validName = (req, res, next) => {
    const {name} = req.body.data;
    if(name) {
        return 
    }
    next({
        status:400,
        message: `Dish must include a name.`,
    });
}

// function namePropertyIsEmpty(req, res, next) {
//     const { data: { name } = {} } = req.body;
//     if (name === "") {
//       next({
//         status: 400,
//         message: `Dish must include a name.`,
//       });
//     }
//     return next();
//   }

const validDescription = (req,res,next) => {
  const {data : { description } = {} } = req.body;
  if (!description || description.length === 0) {
      return next({
          status: 400,
          message: "Dish must include description"
      })
}
};

const noPriceProp = (req, res, next) => {
    const{data: {price} = {} } = req.body;
     if (typeof price != "number" || price <= 0)  {
        return next({
            status: 400,
            message: "Dish must include a price"
        })
    }
}


const validPrice = (req, res, next) => {
    const {data: {price} = {} } = req.body;
    if (typeof price != "number" || price <= 0) {
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
}

const validImage = (req, res, next) => {
  const {data: {image_url} = {} } = req.body;
  if (!image_url) {
      return next({
          status:400, 
          message: "Dish must include an image_url"
      })
  }
}

const validIds = (req, res, next) => {
    const {data: {id} = {} } = req.body;
    const {dishId} = req.params;
    if (id === dishId || !id) {
        return 
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}.`
    })
}

const createValidation = (req, res, next) => {
    validName(req, res, next);
    validDescription(req, res, next);
    noPriceProp(req, res, next);
    validPrice(req, res, next);
    validImage(req, res, next);
    next();
 };
 

 const readValidation = (req, res, next) => {
    dishExists(req, res, next);
    next();
 };

 const updateValidation = (req, res, next) => {
    dishExists(req, res, next);
    validName(req, res, next);
    validDescription(req, res, next);
    validPrice(req, res, next);
    validImage(req, res, next);
    validIds(req, res, next);
    next();
 };
 
 function read(req, res) {
    res.json({ data: res.locals.dish });
 }
 
 function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newId = new nextId;
    const newDish = {
      id: newId,
      name: name,
      description: description,
      price: price,
      image_url: image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }

  function update(req, res) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  
    res.json({ data: dish });
  }
  
  module.exports = {
    create: [createValidation, create],
    read: [readValidation, read],
    update: [updateValidation, update],
    list,
 };