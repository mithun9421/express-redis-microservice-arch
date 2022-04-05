const express = require('express');
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));// enable this if you run behind a proxy (e.g. nginx)
app.set('trust proxy', 1);

const RedisStore = connectRedis(session)//Configure redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
})

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});

redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});//Configure session middleware

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge: 1000 * 60 * 10 // session max age in miliseconds
    }
}))

app.get("/", (req, res) => {
    const sess = req.session;
    if (sess.username && sess.password) {
        if (sess.username) {
            res.write(`<h1>Welcome ${sess.username} </h1><br>`)
            res.write(
                `<h3>This is the Home page</h3>`
            );
            res.end('<a href=' + '/logout' + '>Click here to log out</a >')
        }
    } else {
        res.sendFile(__dirname + "/index.html")
    }
});

app.listen(3001, () => {
    console.log("Server started at port 3001")
});