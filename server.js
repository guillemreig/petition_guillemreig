// SETUP
const PORT = 8000; //Set the port to be used
const path = require("path"); // Require 'path'
const express = require("express"); // require express
const app = express(); // create a new instance of express

const cookieSession = require("cookie-session");

// Handlebars setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Database
const db = require("./db");

// Encryption
const bcrypt = require("bcryptjs");

// STATIC

app.use(express.static(path.join(__dirname, "public")));

// STARTUP

// db.getAllPetitions().then((rows) => {
//     console.log("Petitions:", rows);
// });
// db.getAllRepresentatives().then((rows) => {
//     console.log("Representatives:", rows);
// });

// MIDDLEWARES

app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 1, // miliseconds * seconds * minutes * hours * days
        nameSite: true,
    })
);

// BODY
// Main page (petition)
app.get("/", (req, res) => {
    console.log("req.session :", req.session);
    res.render("welcome", { title: "Petition", ...req.session });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.post("/login", (req, res) => {
    console.log("LOG IN. req.body:", req.body);
    db.getRepresentative(req.body.email)
        .then((data) => {
            console.log("data :", data);
            console.log("data.length :", data.length);
            if (data.length) {
                if (data[0].password === req.body.password) {
                    req.session = { login: true, ...data[0] };
                    req.session.password = null;
                    res.redirect("/");
                } else {
                    let renderObj = { title: "Welcome", error_password: true };
                    res.render("welcome", renderObj);
                }
            } else {
                let renderObj = { title: "Welcome", error_email: true };
                res.render("welcome", renderObj);
            }
        })
        .catch((error) => {
            console.log("error: ", error);
            res.redirect("/");
        });
});

// registration
app.post("/", (req, res) => {
    console.log("REGISTRATION. req.body:", req.body);

    db.createRepresentative(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.image_url, req.body.quote)
        .then((data) => {
            console.log("Checkpoint 3. data:", data);
            req.session = { login: true, ...data[0] };
            req.session.password = null;
            res.redirect("/");
        })
        .catch((error) => {
            console.log("error: ", error);
            res.redirect("/");
        });
});

// Petitions
app.get("/petitions", (req, res) => {
    res.render("petitions", req.session);
});

app.post("/petitions", (req, res) => {
    console.log("NEW PETITION. req.body:", req.body);

    if (!req.body.petition || !req.body.signature_url) {
        let renderObj = { title: "Petition", error_petition: !req.body.petition, error_signature: !req.body.signature, ...req.session };
        res.render("petitions", renderObj);
    } else {
        db.createPetition(req.session.id, req.body.petition, req.body.signature_url)
            .then((data) => {
                console.log("Checkpoint 3. data:", data);
                res.redirect("/thankyou");
            })
            .catch((error) => {
                console.log("error: ", error);
                res.redirect("/petitions");
            });
    }
});

// Thank you page
app.get("/thankyou", (req, res) => {
    Promise.all([db.getPetition(req.session.id) /*, db.countSigners()*/]).then((results) => {
        console.log("results[0][0] :", results[0][0]);
        res.render("thankyou", { title: "Thank you!", petition: results[0][0].petition, signature_url: results[0][0].signature_url, ...req.session });
    });
});

app.post("/petitions", (req, res) => {
    // Check if the input is correct: first_name, last_name, signature
    //      STORE in database
    //      SET a cookie
    //      redirect to thank-you page
    // Else display error message
    //      where is the error?
    //      show the form again with error message
    console.log("Checkpoint 2. req.body:", req.body);

    db.createRepresentative(req.body.first_name, req.body.last_name, req.body.image_url, req.body.quote)
        .then((result) => {
            console.log("Checkpoint 3.");
            db.getAllRepresentatives().then((rows) => {
                console.log("Representatives:", rows);
            });
            res.redirect("/");
        })
        .catch((err) => {
            console.log("err: ", err);
        });
});

app.get("/representatives", (req, res) => {
    res.render("representatives", req.session);
});

app.get("/votenow", (req, res) => {
    res.render("votenow", req.session);
});

// app.get("/", (req, res) => {
//     // if user has not signed:
//     //      render the petition page with the form
//     // else
//     //      redirect to thank-you page
// });

// Submit
app.post("/", (req, res) => {
    // Check if the input is correct: first_name, last_name, signature
    //      STORE in database
    //      SET a cookie
    //      redirect to thank-you page
    // Else display error message
    //      where is the error?
    //      show the form again with error message
});

// Thank you page
app.get("/thank-you", (req, res) => {
    // If user has signed
    //      Get data from db
    //      show info: thank you for signing + how many people has signed
    // else
    //      redirect to petition page
});

app.get("/signatures", (req, res) => {
    // if user has signed
    //      Get data from db
    //
});

// EXAMPLE

// db.createCity();

// INITIALIZATION
app.listen(PORT, () => {
    console.log(`Checkpoint 0: Listening on port: ${PORT}`);
});
