//import express
const express = require('express');
const app = express();
//port number
const PORT = 3000;

//simple route
app.get('/', (req, res) => {
    res.send("Hello from full stack backend server!");
});
// start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});