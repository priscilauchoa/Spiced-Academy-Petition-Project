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

app.post("/test", (req, res) => {
    console.log("### GET headers", req.headers);
    console.log("### GET body", req.body);

    res.json({ success: true });
});
app.get("/test", (req, res) => {
    console.log("--->> GET petition", req.headers);

    res.json({ name: "Priscila" });
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {});
});

app.post("/petition", function (req, res) {
    console.log("### POST petition", req.body);
    db.signPetition(req.body.first, req.body.last, req.body.sig)
        .then(() => {
            db.getPetition();
            res.redirect("/thanks");
        })
        .catch((e) => {
            console.log("error--->", e);
            res.status(500).send(e.message);
            // res.render("petition", {
            //     layout: "main",
            // });
        });
});

app.listen(8080, console.log("Listening 8080 🚪👂"));
