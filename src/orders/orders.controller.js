const { stat } = require("fs");
const path = require("path");
const { indexOf } = require("../data/orders-data");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Router function to list all orders
function list(req, res) {
  res.json({ data: orders });
}

// Middleware functions to handle creating an order
// Middleware function to check if deliverTo property exists
function deliverToPropertyExists(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  next({
    status: 400,
    message: `Order must include a deliverTo.`,
  });
}

// Middleware function to check if deliverTo property is empty
function deliverToPropertyIsEmpty(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo === "") {
    next({
      status: 400,
      message: `Order must include a deliverTo.`,
    });
  }
  return next();
}

// Middleware function to cehck if mobileNumber property exists
function mobileNumberPropertyExists(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
  next({
    status: 400,
    message: `Order must include a mobileNumber.`,
  });
}

// Middleware function to check if mobileNumber property is empty
function mobileNumberPropertyIsEmpty(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber === "") {
    next({
      status: 400,
      message: `Order must include a mobileNumber.`,
    });
  }
  return next();
}

// Middleware function to check if dishes property exists
function dishesPropertyExists(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes) {
    return next();
  }
  next({
    status: 400,
    message: `Order must include a dish.`,
  });
}

// Middleware function to check dishes property is an array
function dishesPropertyIsAnArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes)) {
    return next();
  }
  next({
    status: 400,
    message: `Order must include at least one dish.`,
  });
}

// Middleware function to check dishes property has at least 1 item
function dishesPropertyHasAtLeastOneDish(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: `Order must include at least one dish.`,
  });
}

// Middleware function to check if each dish has a quantity property
function dishHasQuantityProperty(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const missingQuantity = dishes.find((dish) => !dish.quantity);
  if (missingQuantity) {
    missingQuantity.index = dishes.indexOf(missingQuantity);
    next({
      status: 400,
      message: `Dish ${missingQuantity.index} must have a quantity that is an integer greater than 0.`,
    });
  }
  return next();
}

// Middleware function to check if each dish has a quantity property greater than 0
function dishHasQuantityPropertyGreaterThanZero(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const incorrectQuantity = dishes.find((dish) => dish.quantity < 1);
  if (incorrectQuantity) {
    incorrectQuantity.index = dishes.indexOf(incorrectQuantity);
    next({
      status: 400,
      message: `Dish ${incorrectQuantity.index} must have a quantity that is an integer greater than 0.`,
    });
  }
  return next();
}

// Middleware function to check if each dish quantity is an integer
function dishHasQuantityPropertyThatIsAnInteger(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const incorrectQuantity = dishes.find(
    (dish) => !Number.isInteger(dish.quantity)
  );
  if (incorrectQuantity) {
    incorrectQuantity.index = dishes.indexOf(incorrectQuantity);
    next({
      status: 400,
      message: `Dish ${incorrectQuantity.index} must have a quantity that is an integer greater than 0.`,
    });
  }
  return next();
}

// Router function to create a new order
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newId = new nextId();
  const newOrder = {
    id: newId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// Middleware function to check if order exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

// Router function to read an order
function read(req, res) {
  res.json({ data: res.locals.order });
}

// Additional middleware functions for update method
// Middleware function to check if id === :orderId
function orderIdsMatch(req, res, next) {
  const { data: { id } = {} } = req.body;
  const { orderId } = req.params;
  if (id === orderId || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  });
}

// Middleware function to check if status property exists
function statusPropertyExists(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status) {
    return next();
  }
  next({
    status: 400,
    message: `Order must have a status of pending, preparing, out-for-delivery, delivered.`,
  });
}

// Middleware function to check if status property is correct value
function statusPropertyIsCorrectValue(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (
    status === "pending" ||
    status === "preparing" ||
    status === "out-for-delivery" ||
    status === "delivered"
  ) {
    return next();
  }
  next({
    status: 400,
    message: `Order must have a status of pending, preparing, out-for-delivery, delivered.`,
  });
}

// Middleware function to check if order has been delivered
function statusPropertyIsDelievered(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status === "delivered") {
    next({
      status: 400,
      message: `A delievered order cannot be changed.`,
    });
  }
  return next();
}

// Router function to update an order
function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

// Middleware function to check if status property is pending
function statusPropertyIsPending(req, res, next) {
  const order = res.locals.order;
  const { status } = order;
  if (status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: `An order cannot be deleted unless it is pending.`,
  });
}

// Router function to delete an order
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);

  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    deliverToPropertyExists,
    deliverToPropertyIsEmpty,
    mobileNumberPropertyExists,
    mobileNumberPropertyIsEmpty,
    dishesPropertyExists,
    dishesPropertyIsAnArray,
    dishesPropertyHasAtLeastOneDish,
    dishHasQuantityProperty,
    dishHasQuantityPropertyGreaterThanZero,
    dishHasQuantityPropertyThatIsAnInteger,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    deliverToPropertyExists,
    deliverToPropertyIsEmpty,
    mobileNumberPropertyExists,
    mobileNumberPropertyIsEmpty,
    dishesPropertyExists,
    dishesPropertyIsAnArray,
    dishesPropertyHasAtLeastOneDish,
    dishHasQuantityProperty,
    dishHasQuantityPropertyGreaterThanZero,
    dishHasQuantityPropertyThatIsAnInteger,
    orderIdsMatch,
    statusPropertyExists,
    statusPropertyIsCorrectValue,
    statusPropertyIsDelievered,
    update,
  ],
  delete: [orderExists, statusPropertyIsPending, destroy],
};