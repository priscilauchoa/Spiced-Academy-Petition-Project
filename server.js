const db = require("./db");
const express = require("express");

const app = express();
const { engine } = require("express-handlebars");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.post("/petition", function (req) {
    db.signPetition(req.body.fisrt, req.body.last, req.body.signature)
        .then(() => {})
        .catch();
});

app.get("/", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.listen(8080, console.log("Listening 8080 🚪👂"));
