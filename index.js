const express = require('express');

const multer = require('multer');

const fs = require('fs');

let path = require('path');

const port = process.env.PORT || 3000;

let app = express();

app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));

const moment = require('moment');

localStorage.setItem("loggedin", false);


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
            localStorage.setItem("loggedin", true);
        }
        else
        {
            
            res.send("We couln't find your account. Please check that your username and password are typed correctly and that your account exists (only current users can create new user accounts).")
            res.render("login");
        }
    })
  
}); 

app.post('/adduser', (req, res) => {
    if (localStorage.getItem('loggedin'))
    {
        knex("security").insert({
            username: req.body.user,
            password: req.body.pass
            
        }).then( newUser => {
            res.redirect("/");
        })
    }
    else
    {
        res.send("Need to sign in in order to access")
        res.render("login");
    }
});

//this adds records to the database in pg admin
app.post('/formDataUpdate', (req, res) => {
    knex("main").insert({
        timestamp:  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        age: parseInt(req.body.surveyAge),
        gender_id: parseInt(req.body.surveyGender),
        relationship_status_id: parseInt(req.body.surveyRelStat),
        occupation_status_id: parseInt(req.body.surveyOccStat),
        university_affiliation: req.body.uniAff,
        private_affiliation: req.body.privAff,
        school_affiliation: req.body.schAff,
        company_affiliation: req.body.comAff,
        government_affiliation: req.body.govAff,
        na_affiliation: req.body.noAff,
        social_media_use: req.body.surveySocUse,
        facebook_use: req.body.facebook,
        twitter_use: req.body.twitter,
        instagram_use: req.body.instagram,
        youtube_use: req.body.youtube,
        discord_use: req.body.discord,
        reddit_use: req.body.reddit,
        pinterest_use: req.body.pinterest,
        tiktok_use: req.body.tiktok,
        snapchat_use: req.body.snapchat,
        average_time_id: parseInt(req.body.avgTime),
        no_purpose_frequency: parseInt(req.body.surveyNoPurpose),
        distracted_frequency: parseInt(req.body.surveyDistract),
        restless_feeling: parseInt(req.body.surveyRestless),
        easily_distracted: parseInt(req.body.surveyEasyDistract),
        bothered: parseInt(req.body.surveyBothered),
        concentration_difficulty: parseInt(req.body.surveyConc),
        comparison_frequency: parseInt(req.body.surveyComp),
        comparison_feeling: parseInt(req.body.surveyCompFeel),
        seek_validation_frequency: parseInt(req.body.surveyValid),
        depressed_frequency: parseInt(req.body.surveyDepression),
        daily_activity_fluctuate: parseInt(req.body.surveyInterest),
        sleep_issues: parseInt(req.body.surveySleep),
        city_id: parseInt(req.body.surveyCity)
    }).then( newUser => {
        res.redirect("completion");
    })
});



app.use(express.static(__dirname + '/public'));

app.listen(port, () => console.log('My server is listening'));