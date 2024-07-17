const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
require("dotenv").config();

const app = express();

app.use(express.json());

app.use("/customer",
    session(
        {
            secret: process.env.SESSION_SECRET,
            resave: true, 
            saveUninitialized: true,
            // cookie: { 
            //     secure: true,
            //     httpOnly: true,
            //     maxAge: 3600000
            //  }
        }))

        //authentification mechanism to check if user hat a valid token
app.use("/customer/auth/*", (req,res,next) => {
     const token = req.session.authorization?.accessToken;

     if(token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if(err) {
                    return res.status(403).json({message: "User not authenticated"});
                }
                req.user = user;
                next();
            });
     } else {
         return res.status(403).json({message: "User not logged in"});
     }
});
 
const PORT =5600;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
