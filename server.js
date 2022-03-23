const db = require("./db");
const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const secrets = require("./secret");
const cookieSession = require("cookie-session");
const { compare, hash } = require("./bc");

app.use(
    cookieSession({
        secret: secrets.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// atob("passa aqui o que quer converter de base64");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(express.static("./public"));

hash("oi").then((hashPass) => {
    // console.log("hashpass", hashPass);
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then((hashedPassword) => {
            // console.log("hashed password:", hashedPassword);
            // console.log(first, last, email);
            return db.registerUser(first, last, email, hashedPassword);
        })
        .then(({ rows }) => {
            console.log(rows);
            req.session.userId = rows[0].id;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error submitting registration values", err);
            // Re-render the same page with an error message
        });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", function (req, res) {
    db.authenticateUser(req.body.email)
        .then((rows) => {
            req.session.LogedId = rows[0].id;
            // res.redirect("/petition");
        })
        .then((rows) => {
            req.session.LogedId = rows[0].id;
            // res.redirect("/petition");
        })
        .catch((e) => {
            console.log("error--->", e);
            console.log("User not found, please register yourself");
            res.status(500).send(e.message);
            res.redirect("/register", {
                layout: "main",
            });
        });
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", function (req, res) {
    // console.log("--->>req.body: ", req.body);
    db.signPetition(req.session.userId, req.body.signature)
        .then(() => {
            // req.session.id = rows[0].id;
            res.redirect("/thanks");
        })
        .catch((e) => {
            console.log("error--->", e);
            res.status(500).send(e.message);
            res.render("petition", {
                layout: "main",
            });
        });
});

app.get("/thanks", (req, res) => {
    db.getSignatureByUserId(req.session.userId).then(({ rows }) => {
        console.log("row get petition thanks get---->", rows);
        res.render("thanks", {
            rows: rows,
        });
    });
});

app.get("/signers", (req, res) => {
    db.getSignatures().then(({ rows }) => {
        console.log("rows get signatures ---->", rows);
        res.render("signers", {
            rows: rows,
        });
    });
});

app.listen(8080, console.log("Listening 8080 🚪👂"));
