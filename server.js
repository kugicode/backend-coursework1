//import express
const express = require('express');
// a node.js utility from combining file and directory paths
const path = require('path');
//interacting with the file system.
const fs = require('fs');
//Import the database connections functions
const { connectToDb, getDb } = require('./db');
//import the required ObjectId from the native MongoDb driver
const { ObjectId } = require('mongodb');

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

//Middleware that handels incoming requests for POST/PUT
app.use(express.json());

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

app.post('/order', async (req, res) => {
    //Get the connected database instance and the order data from the client
    const db = getDb();
    const orderData = req.body;
    //Basic validation: Ensure the client sent all the necessary data fields
    if(!orderData || !orderData.name || !orderData.phone || !orderData.cart || orderData.cart.length === 0){
        return res.status(400).json({error: "Order details are incomplete or the cart is empty."});
    }
//prepare the required data fields
    try{
        const orderToInsert = {
            name: orderData.name,
            phone: orderData.phone,
            //Extract the unique MongoDB IDs and quantities from the cart items:
            lessonDetails: orderData.cart.map(item => ({
                lessonId: item._id,
                quantity: item.quantity
            })),
            totalSpaces: orderData.cart.reduce((total, item) => total + item.quantity, 0),
            data: new Date()
        };
        //Insert the order into the order collection
        const result = await db.collection('order').insertOne(orderToInsert);

        res.status(201).json({
            message: "Order placed successfully.",
            orderId: result.insertedId
        });
    }

    catch(error){
        console.error("Error saving order: ", error);
        res.status(500).json({error: "Could not save the order document."});
    }

    });

    app.put('/lessons/:id', async (req, res) => {
        const db = getDb();
        const lessonId = req.params.id // Gets the id from the url
        const updateData = req.body; // Gets the new data

        //Validation check to enure the id is valid
        if(!lessonId){
            return res.status(400).json({error: "Lesson id is required for update."});
        }

        //update document
        //MongoDb uses $set operator to to make changes without chaning the entire document.
        const updateDocument = {
            $set: updateData,
        };

        //perform the update query
        try{
           const result = await db.collection('lesson').updateOne(
            {_id: new ObjectId(lessonId)}, // finds the lesson by converting the string id to a MongoDb ObjectId
            updateDocument //Applies the changes
           ); 
           //Check if a document was actually updated
           if(result.matchedCount === 0){
            res.status(404).json({error: "Lesson not found or ID is invalid"});
           }

           //send success response
           res.status(200).json({
            message: "Lesson has been successfully updated.",
            lessonModified: result.modifiedCount
           });
        }
        catch(error){
        console.error("Error updating lesson: ", error);
        res.status(500).json({error: "Could not update the lesson document!"});
        }
    });

    app.get('/search', async (req, res) => {
        const db = getDb();
        const searchTerm = req.query.q; //The search term is retrieved from the URL query

        //Validation check
        if(!searchTerm || searchTerm.trim() === ''){
            //If search term is empty, then return all lessons!
            return res.status(200).json([]);
        }

        //prepare the search query
        const searchRegex = new RegExp(searchTerm.trim(), 'i'); //Creates a case-insensitive regular expression

        //MongoDB uses the $or operator to check multiple conditions on the same document
        const searchQuery = {
        $or: [
            {subject: {$regex: searchRegex}},
            {location:{$regex: searchRegex}},
            //Since price and spaces are numbers in MongoDB, we assume a string match is sufficient for the search logic
            {price: {$regex: searchRegex}},
            {spaces :{$regex: searchRegex}},

        ]
        };

        //perform the database query
        try{
            const lessons = await db.collection('lesson')
            .find(searchQuery) // Finds documents matching any condition in $or
            .toArray();
            //Send the data back as json
            res.status(200).json({lessons});
        }
        catch(error){
            console.error("Error performing search:", error);
            res.status(404).json({error: "Could not perform the search query."});
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