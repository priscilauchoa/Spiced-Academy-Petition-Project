const db = require("./db");
const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const secrets = require("./secret");
const cookieSession = require("cookie-session");

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
app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", function (req, res) {
    console.log("req.body: ", req.body);
    db.signPetition(req.body.first, req.body.last, req.body.signature)
        .then(({ rows }) => {
            req.session.id = rows[0].id;
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
    db.getPetition(req.session.id).then(({ rows }) => {
        console.log("row get petition thanks get---->", rows);
        res.render("thanks", {
            rows: rows,
        });
    });
});

app.get("/signers", (req, res) => {
    db.getPetition().then((rows) => {
        res.render("signers", {
            rows: rows,
        });
    });
});

app.listen(8080, console.log("Listening 8080 🚪👂"));
