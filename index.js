const express = require('express');

const multer = require('multer');

const fs = require('fs');

let path = require('path');


const knex = require('knex')({
client: 'pg',
connection: {
    host: process.env.RDS_HOSTNAME || 'localhost',
    user: process.env.RDS_USERNAME || 'test',
    password: process.env.RDS_PASSWORD || 'test',
    database: process.env.RDS_DB_NAME || 'intex',
    port: process.env.RDS_PORT || 5432
}
});


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

app.post("/login", (req, res) => {
    knex.select("username", "password").from('security').where({'username': req.body.user, "password": req.body.pass}).then( account => {
        if (account.length)
        {
            res.render("/landing");
        }
        else
        {
            alert("Invaldi Credentials");
            res.render("/login")

        }
    })
  
}); 


app.use(express.urlencoded({extended:true}));

app.use(express.static(__dirname + '/public'));

app.listen(port, () => console.log('My server is listening'));