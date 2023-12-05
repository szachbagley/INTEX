const express = require('express');

const multer = require('multer');

const fs = require('fs');

let path = require('path');

const port = process.env.PORT || 3000;

let app = express();

app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));


const knex = require('knex')({
client: 'pg',
connection: {
    host: process.env.RDS_HOSTNAME || 'localhost',
    user: process.env.RDS_USERNAME || 'test',
    password: process.env.RDS_PASSWORD || 'test',
    database: process.env.RDS_DB_NAME || 'intex',
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
}
});

app.get("/", (req, res) => {  
    res.render('landing');
});

app.get("/landing", (req, res) => {  
    res.render('landing');
});

app.get("/login", (req, res) => {      
    res.render('login');
});

app.get("/addaccount", (req, res) => {      
    res.render('addaccount');
});

app.get("/survey", (req, res) => {
    res.render('survey');
})

app.post("/login", (req, res) => {
    knex.select("username", "password").from('security').where({'username': req.body.user, "password": req.body.pass}).then( account => {
        if (account.length)
        {
            res.render("landing");
        }
        else
        {
            //"alert" doesn't work on the node app i guess
            //alert("We couln't find your account. Please check that your username and password are typed correctly and that your account exists (only current users can create new user accounts).");
            res.render("login");
        }
    })
  
}); 

app.post('/adduser', (req, res) => {
    knex("security").insert({
        username: req.body.user,
        password: req.body.pass
        
     }).then( newUser => {
        res.redirect("/");
     })
});



app.use(express.static(__dirname + '/public'));

app.listen(port, () => console.log('My server is listening'));