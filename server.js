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
//     console.log("hashpass", hashPass);
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
                    res.redirect("/profile");
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
    req.session = null;
});

app.post("/login", function (req, res) {
    console.log("req.body------>>>", req.body);
    db.authenticateUser(req.body.email)
        .then(({ rows }) => {
            // console.log("rows authenticate user--->", rows);
            return compare(req.body.password, rows[0].password).then(
                (match) => {
                    if (match) {
                        req.session.userId = rows[0].id;
                    } else {
                        throw new Error("Password does not match");
                    }
                    console.log("ROWWWW----->", rows);
                    return rows;
                }
            );
        })
        .then((rows) => {
            console.log("Signature ---->", rows);
            //--->  let [first, second] = rows;//exemplo desestruturação de vetor
            if (rows[0].signature == null) {
                res.redirect("/petition");
                db.signPetitionLater(
                    req.session.userId,
                    req.body.signature
                ).then(() => {
                    res.redirect("/thanks");
                });
            } else {
                // signed = false;
                res.redirect("/thanks");
                // res.render("/petition", {
                //     layout: "main",
                //     signed,
                // });
            }
        })
        .catch((e) => {
            console.log("authentication error2--->", e);
            res.render("login", {
                err: "User not found",
            });
        });
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    const { age, city, homepage } = req.body;
    // if(homepage.indexOf('https'){

    // }
    db.registerMoreInfo(req.session.userId, age, city, homepage)
        .then(() => {
            // console.log(req.session);
            res.redirect("/petition");
        })
        .catch(() => {
            res.render("profile", {
                err: "Invalid information, user alredy exists",
            });
            // console.log("error submitting registration values", err);
            // Re-render the same page with an error message
        });
});

app.get("/home", (req, res) => {
    res.render("home");
});
// comand + d = split vertical iterm
//  comand + k = limpa terminal
//  comand + [ muda de janela ]
//command + shif + enter = full screen  no iterm
// npm i -D nodemon and change package.json -- npm run dev

app.get("/petition", (req, res) => {
    if (req.session.userId) {
        db.getSignatures(req.session.signedId).then((signatures) => {
            res.render("petition", {
                layout: "main",
                signed: signatures.length > 0, //se tiver signature não mostra mensagem
            });
        });
    } else {
        // se nao estiver logado, ele nao deve ver petition
        res.redirect("/login");
    }
});

app.post("/petition", function (req, res) {
    if (req.body.signature == "") {
        res.redirect("/home");
    }
    // console.log("--->>req.body: ", req.body);
    // console.log("--->>req.session: ", req.session.userId);
    else {
        db.signPetition(req.session.userId, req.body.signature)
            .then(({ rows }) => {
                console.log("--->>rows in post petition: ", rows);
                req.session.id = rows[0].id;
                // if (rows[0].signature == "") {
                //     res.redirect("/home");
                // } else {
                res.redirect("/thanks");
                // }
            })
            .catch((e) => {
                console.log("error3--->", e);
                res.status(500).send(e.message);
                res.render("petition", {
                    layout: "main",
                });
            });
    }
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

app.get("/signers/:city", (req, res) => {
    db.signersCity(req.params.city).then(({ rows }) => {
        res.render("signersbycities", {
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
