//import express
const express = require('express');
const app = express();
//port number
const PORT = 3000;

const loggerMiddleware = (req, res, next) => {
    //creates a new javascript date object the contains the current time.
    //.isISOString() a method of the date object the converts to the time into ISO format.
    const timeStamp = new Date().toISOString();
    //logging each req with time, the method of the post and the url!
    console.log(`${timeStamp} ${req.method} Request to ${req.url}`);
    next();
}

//using the loggerMiddleware.
app.use(loggerMiddleware);
app.use(express.static('images'));

//simple route
app.get('/', (req, res) => {
    res.send("Hello from full stack backend server!");
});
// start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});