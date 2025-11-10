//import express
const express = require('express');
// a node.js utility from combining file and directory paths
const path = require('path');
//interacting with the file system.
const fs = require('fs');

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

app.use('/images', (req, res, next) => {
    //Get the full path for the images
    const filePath = path.join(__dirname, 'public', req.url);
    //check if the image file located in public exists and not the root directory
    if(fs.existsSync(filePath) && req.url !== '/'){
        next();
    }
    else{
        //send the error if no file exists!
        res.status(404).send('Error: image file not found as requested.');
    }
});
//Static file server
app.use('/images', express.static('public'));


//simple route
app.get('/', (req, res) => {
    res.send("Hello from full stack backend server!");
});
// start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});