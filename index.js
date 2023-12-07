//all of these are importing express and other needed engines and setting up the basics to make routes work
const express = require('express');

const multer = require('multer');

const fs = require('fs');

let path = require('path');

const session = require('express-session');

const port = process.env.PORT || 3000; //this works with aws and localhost

let app = express();

app.set('view engine', 'ejs');

// Set up session middleware, this allows us to see if a user is logged in when they go to visit certain pages
app.use(session({
    secret: 'secret-intexfa23-key',
    resave: false,
    saveUninitialized: true
  }));

app.use(express.urlencoded({ extended: true }));

const moment = require('moment');

//This sets up the database to work both with RDS and with local postgres
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

//This is the page that renders when the user first logs in
app.get("/", (req, res) => {  
    res.render('landing');
});

//this routes to the page when the survey is completed
app.get("/completion", (req, res) => {  
    res.render('completion');
});

//this routes to the dashboard
app.get("/dashboard", (req, res) => {  
    res.render('dashboard');
});

//this routes to the login page
app.get("/login", (req, res) => {      
    res.render('login');
});

//this routes to the resources page
app.get("/resources", (req, res) => {      
    res.render('resources');
});

//this routes to the add an account page
app.get("/addaccount", (req, res) => { 
    if (req.session.account) { //this checks if the user has already logged on in this session
        res.render('addaccount');
    } else {
      res.render('unauthorized'); //if the user hasn't logged on then it will reoute them to an unauthorized page
    };     
});

//this routes to the survey page
app.get("/survey", (req, res) => {
    res.render('survey');
})

//this route checks the logic of the login page
app.post("/login", (req, res) => {
    knex.select("username", "password").from('security').where({'username': req.body.user, "password": req.body.pass}).then( account => {
        if (account.length) //this checks that the username and password matched the RDS table
        {
            req.session.account = account; //this creates a session so the report and add account can be accessed
            res.redirect("/");
         }
        else
        {
            req.session.account = null;
            res.render("incorrectuser"); //this renders a page saying it was an incorrect login
        }
    })
}); 

//this route allows a new user to be created
app.post('/adduser', (req, res) => {
    
        knex("security").insert({ //this passes the info to a new record
            username: req.body.user,
            password: req.body.pass
            
        }).then( newUser => {
            res.redirect("/"); //after the record is created they are redirected to the home page
        })
});

//this adds records to the database in RDS
app.post('/formDataUpdate', (req, res) => {
//this goes line by line inserting data into the main database

    knex("main").insert({
        timestamp:  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'), //this is the format to insert date/time records
        age: parseInt(req.body.surveyAge),
        gender_id: parseInt(req.body.surveyGender),
        relationship_status_id: parseInt(req.body.surveyRelStat),
        occupation_status_id: parseInt(req.body.surveyOccStat),
        //the logic for the following pages says if checked pass 'Y' and of not checked send 'N'
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
        res.redirect("/completion"); //once the survey is sent it sends the user to the completed page
    })
});

//this route creates the report table without any filters
app.get('/report', (req, res) => {
    if (req.session.account) {//this checks if the user is logged in
        //this joins all of the tables together
        knex.select().from('main')
        .join('average_time', 'main.average_time_id', '=', 'average_time.average_time_id')
        .join('city', 'main.city_id', '=', 'city.city_id')
        .join('gender', 'main.gender_id', '=', 'gender.gender_id')
        .join('occupation', 'main.occupation_status_id', '=', 'occupation.occupation_status_id')
        .join('relationship', 'main.relationship_status_id', '=', 'relationship.relationship_status_id')
        .then( allSurveys => {
            res.render('report', {mySurveys : allSurveys}); //this returns all of the values to the report page where they dynamically load
        });
    } else {
      res.render('unauthorized'); //if they aren't logged in it gives a message
    }
  });

//this route allows the report to be filtered on the report page
app.get('/filterReport', (req, res) => {
    if (req.session.account) { //this checks again if the user is logged in
        let queryBuilder = knex.select().from('main')
        .join('average_time', 'main.average_time_id', '=', 'average_time.average_time_id')
        .join('city', 'main.city_id', '=', 'city.city_id')
        .join('gender', 'main.gender_id', '=', 'gender.gender_id')
        .join('occupation', 'main.occupation_status_id', '=', 'occupation.occupation_status_id')
        .join('relationship', 'main.relationship_status_id', '=', 'relationship.relationship_status_id');
        //these allow any number of the filters to be added into the query
        if (req.query.entry_id_filter){
            let parsed_entry_id = parseInt(req.query.entry_id_filter);
            queryBuilder = queryBuilder.where('main.entry_id', parsed_entry_id)
        }
        if (req.query.age_filter){
            let parsed_age = parseInt(req.query.age_filter);
            queryBuilder = queryBuilder.where('main.age', parsed_age)
        }
        if (req.query.gender_filter){
            if (req.query.gender_filter != ""){
                let parsed_gender = parseInt(req.query.gender_filter);
                queryBuilder = queryBuilder.where('main.gender_id', parsed_gender)
            }
        }
        if (req.query.rel_filter){
            if (req.query.rel_filter != ""){
                let parsed_rel = parseInt(req.query.rel_filter);
                queryBuilder = queryBuilder.where('main.relationship_status_id', parsed_rel)
            }
        }
        if (req.query.occ_filter){
            if (req.query.occ_filter != ""){
                let parsed_occ = parseInt(req.query.occ_filter);
                queryBuilder = queryBuilder.where('main.occupation_status_id', parsed_occ)
            }
        }
        if (req.query.city_filter){
            if (req.query.city_filter != ""){
                let parsed_city = parseInt(req.query.city_filter);
                queryBuilder = queryBuilder.where('main.city_id', parsed_city)
            }
        }
        //once all the filters are put in it sends the query to RDS
        queryBuilder.then( allSurveys => {
            if (allSurveys.length) { //if any results return it sends them
            res.render('report', {mySurveys : allSurveys});
            }
            else {
                res.render('nodata'); //if no results match it sends a message
            }
        });
    } else {
        res.render('unauthorized'); //if not logged in it sends an issue
    }
});

app.use(express.static(__dirname + '/public'));

app.listen(port, () => console.log('My server is listening'));