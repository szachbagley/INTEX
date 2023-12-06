const express = require('express');

const multer = require('multer');

const fs = require('fs');

let path = require('path');

const session = require('express-session');

const port = process.env.PORT || 3000;

let app = express();

app.set('view engine', 'ejs');

// Set up session middleware
app.use(session({
    secret: 'secret-intexfa23-key',
    resave: false,
    saveUninitialized: true
  }));

app.use(express.urlencoded({ extended: true }));

const moment = require('moment');


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
    console.log(req.session.account)
    res.render('landing');
});

app.get("/completion", (req, res) => {  
    res.render('completion');
});

app.get("/dashboard", (req, res) => {  
    res.render('dashboard');
});



app.get("/finish", (req, res) => {  
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
            req.session.account = account;
            console.log(req.session.account);
            res.render("landing");
        }
        else
        {
            req.session.account = null;
            console.log(req.session.account);
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

//this adds records to the database in pg admin
app.post('/formDataUpdate', (req, res) => {
    knex("main").insert({
        timestamp:  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        age: parseInt(req.body.surveyAge),
        gender_id: parseInt(req.body.surveyGender),
        relationship_status_id: parseInt(req.body.surveyRelStat),
        occupation_status_id: parseInt(req.body.surveyOccStat),
        university_affiliation: req.body.uniAff === 'Y' ? 'Y' : 'N',
        private_affiliation: req.body.privAff === 'Y' ? 'Y' : 'N',
        school_affiliation: req.body.schAff === 'Y' ? 'Y' : 'N',
        company_affiliation: req.body.comAff === 'Y' ? 'Y' : 'N',
        government_affiliation: req.body.govAff === 'Y' ? 'Y' : 'N',
        na_affiliation: req.body.noAff === 'Y' ? 'Y' : 'N',
        social_media_use: req.body.surveySocUse === 'Y' ? 'Y' : 'N',
        facebook_use: req.body.facebook === 'Y' ? 'Y' : 'N',
        twitter_use: req.body.twitter === 'Y' ? 'Y' : 'N',
        instagram_use: req.body.instagram === 'Y' ? 'Y' : 'N',
        youtube_use: req.body.youtube === 'Y' ? 'Y' : 'N',
        discord_use: req.body.discord === 'Y' ? 'Y' : 'N',
        reddit_use: req.body.reddit === 'Y' ? 'Y' : 'N',
        pinterest_use: req.body.pinterest === 'Y' ? 'Y' : 'N',
        tiktok_use: req.body.tiktok === 'Y' ? 'Y' : 'N',
        snapchat_use: req.body.snapchat === 'Y' ? 'Y' : 'N',
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
        res.redirect("/completion");
    })
});

// Set up /report route
app.get('/report', (req, res) => {
    console.log(req.session.account);
    if (req.session.account) {
        knex.select().from('main')
        .join('average_time', 'main.average_time_id', '=', 'average_time.average_time_id')
        .join('city', 'main.city_id', '=', 'city.city_id')
        .join('gender', 'main.gender_id', '=', 'gender.gender_id')
        .join('occupation', 'main.occupation_status_id', '=', 'occupation.occupation_status_id')
        .join('relationship', 'main.relationship_status_id', '=', 'relationship.relationship_status_id')
        .then( allSurveys => {
            res.render('report', {mySurveys : allSurveys});
        });
    } else {
      res.render('unauthorized');
    }
  });

  app.get('/report/:entry_id_filter', (req, res) => {
    console.log(req.session.account);
    if (req.session.account) {
        let parsedNum = parseInt(req.params.entry_id_filter);
        knex.select().from('main')
        .join('average_time', 'main.average_time_id', '=', 'average_time.average_time_id')
        .join('city', 'main.city_id', '=', 'city.city_id')
        .join('gender', 'main.gender_id', '=', 'gender.gender_id')
        .join('occupation', 'main.occupation_status_id', '=', 'occupation.occupation_status_id')
        .join('relationship', 'main.relationship_status_id', '=', 'relationship.relationship_status_id')
        .where('main.entry_id', parsedNum)
        .then( allSurveys => {
            if (allSurveys.length) {
            res.render('report', {mySurveys : allSurveys});
            }
            else {
                res.render('nodata');
            }
        });
    } else {
      res.render('unauthorized');
    }
  });
  

app.use(express.static(__dirname + '/public'));

app.listen(port, () => console.log('My server is listening'));