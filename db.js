//load environmental variables
// We call this first to load the MONGO_URI
require('dotenv').config();

//import the required native mongodb components
const { MongoClient } = require('mongodb');

//getting the connection string from the environmental variable.
const uri = process.env.MONGO_URI;

//create a new mongoclient instance
const client = new MongoClient(uri);

// variable to hold the connected database and client
let db;

//define the connection function
async function connectToDb(){
    try{
    await client.connect();
        db = client.db("Full-Stack-App");

        console.log("Connected to MongoDb atlas!");
    }

    catch(error){
        console.error("Failed to connect to MongoDb atlas!", error);
        //Stop the server if the database connection fails.
        process.exit(1);
    }
}

//Getter function to allow server.js to retrieve the connected database instance.
function getDb(){
    return db;
}

//Export both function.
module.exports = {
    connectToDb,
    getDb
}