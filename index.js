/* index.js file of nodejs */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var cors = require('cors');
var cron = require('node-cron');
var cronSchedule = require('./dbSync');
var dotenv = require('dotenv');
dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, function () {

    console.log('Example app listening on port ' + port);
});

cron.schedule('* * * * * *', () => {

    try {
        console.log("In cron job")
        cronSchedule();
    } catch (error) {
        console.error('Error running cron job:', error);
    }
   
});


module.exports = app;