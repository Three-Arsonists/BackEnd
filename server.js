const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const passport = require('passport'); 
const passportConfig = require('./passport');
const mongoose = require("mongoose");
require("dotenv").config(); // 환경변수를 위한 dotenv

const server = require('http').createServer(app);

app.use(cors()); // cors 미들웨어를 삽입합니다.

app.get('/', (req,res) => { // 요청패스에 대한 콜백함수를 넣어줍니다.
    res.send({message:'hello'});
});

const url = process.env.ATLAS_URL; // mongoDB Connect정보
mongoose
    .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
    });

server.listen(8080, ()=>{
    console.log('server is running on 8080')
})

app.use(passport.initialize());
passportConfig();