const express = require('express');

const multer = require('multer');

const fs = require('fs');

let path = require('path');

/* // this will set up the database
const knex = require('knex')({
client: 'pg',
connection: {
host: process.env.RDS_HOSTNAME || 'localhost',
user: process.env.RDS_USERNAME || 'postgres',
password: process.env.RDS_PASSWORD || 'admin',
database: process.env.RDS_DB_NAME || 'bucket_list',
port: process.env.RDS_PORT || 5432
}
});
*/

const port = process.env.PORT || 3000;

let app = express();

app.set('view engine', 'ejs');

app.get("/", (req, res) => {  
    res.render('landing');
});

app.get("/landing", (req, res) => {  
    res.render('landing');
});

app.get("/login", (req, res) => {      
    res.render('login');
});

app.get("/survey", (req, res) => {
    res.render('survey');
})

app.use(express.urlencoded({extended:true}));

app.use(express.static(__dirname + '/public'));

app.listen(port, () => console.log('My server is listening'));