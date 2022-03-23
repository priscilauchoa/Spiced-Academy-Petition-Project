const db = require("./db");
const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const secrets = require("./secret");
const cookieSession = require("cookie-session");
const { compare, hash } = require("./bc");

// app.use((re, res, next) => {
//     res.set("x-frame-option", "deny");
//     next(); //protege contra iframe no seu site. iframe é um site dentro do seu site.
// });

app.use(
    cookieSession({
        secret: secrets.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
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

// hash("oi").then((hashPass) => {
//     // console.log("hashpass", hashPass);
// });

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then((hashedPassword) => {
            // console.log("hashed password:", hashedPassword);
            // console.log(first, last, email);
            db.registerUser(first, last, email, hashedPassword)
                .then(({ rows }) => {
                    console.log(rows);
                    req.session.userId = rows[0].id;
                    console.log(req.session);
                    res.redirect("/petition");
                })
                .catch((err) => console.log(err));
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
        .then(({ rows }) => {
            // TODO : como comparar as senhas???? assim não funciona
            console.log(rows);
            compare(req.body.password, rows[0].password).then((match) => {
                console.log("Does the password match the one stored?", match);
                req.session.userId = rows[0].id;

                // If this value is true then set a cookie with the user's id
                // something like req.session.userId.
                // THEN: you will want to check if they have SIGNED
                // If so, set another cookie to remember this and redirect them
                // to the /thanks page, otherwise redirect them to then /petition page.
                // If an error occurs, re-render the page with an appropriate message.
            });

            // res.redirect("/petition");
        })

        // .then((rows) => {
        //     req.session.LogedId = rows[0].id;
        //     // res.redirect("/petition");
        // })
        .catch((e) => {
            console.log("error--->", e);
            console.log("User not found, please register yourself");
            res.status(500).send(e.message);
            // res.redirect("/register", {
            //     layout: "main",
            // });
        });
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", function (req, res) {
    console.log("--->>req.body: ", req.body);
    console.log("--->>req.session: ", req.session.userId);
    db.signPetition(req.session.userId, req.body.signature)
        .then(({ rows }) => {
            console.log("--->>rows in post petition: ", rows);
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
app.listen(process.env.PORT || 8080, function () {
    console.log("Listening 8080 🚪👂");
});

// app.listen(8080, console.log("Listening 8080 🚪👂"));
// if (!(req.session.user.signatureId{
//     return res.redirect(/petition)
// }))
