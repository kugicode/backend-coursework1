//import express
const express = require('express');
// a node.js utility from combining file and directory paths
const path = require('path');
//interacting with the file system.
const fs = require('fs');
//Import the database connections functions
const { connectToDb, getDb } = require('./db');

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
// app.get('/', (req, res) => {
//     res.send("Hello from full stack backend server!");
// });

app.get('/lessons', async (req, res) => {
    const db = getDb(); //Get the connected database instance.

    try{
        const lessons = await db.collection('lesson')
        .find({}) // Retrieves all documents
        .toArray() // Converts the mongoDB results into a standard JS Array.

        res.status(200).json(lessons); //send the data back as json
    }

    catch(error){
        //error messages if it fails
        console.error("Error fetching lessons:", error);
        res.status(404).json({error: "Could not fetch the lessons document."});
    }
});

// start the databse connection 
connectToDb()
.then((dbInstance) => {
    app.listen(PORT , () => {
        console.log(`Server is listening on http://localhost:${PORT}`)
    });
})
.catch(error => {
    console.error("Server failed to start due to DB connectio error:", error);
});