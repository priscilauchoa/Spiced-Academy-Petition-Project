const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
const { compare, hash } = require("./bc");
const db = require("./db");
const {
    requireLoggedOutUser,
    requireLoggedInUser,
    requireNoSignature,
    requireSignature,
} = require("./middleware");

// console.log("db --->", db);
const sessionSecret =
    process.env.SESS_SECRET || require("./secret.json").SESS_SECRET;

app.use(
    cookieSession({
        secret: sessionSecret,
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
app.get("/", (req, res) => {
    res.redirect("/home");
});

app.get("/home", (req, res) => {
    let logged = req.session.userId;
    res.render("home", {
        logged,
    });
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register");
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password).then((hashedPassword) => {
        db.registerUser(first, last, email, hashedPassword)
            .then(({ rows }) => {
                console.log(rows);
                req.session.userId = rows[0].id;
                console.log(req.session);
                res.redirect("/profile");
            })
            .catch((err) => {
                console.log("error 6 ---->", err);
                res.render("register", {
                    err: "User already exists",
                });
            });
    });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login");
});

app.post("/login", requireLoggedOutUser, function (req, res) {
    // console.log("req.body------>>>", req.body);
    db.authenticateUser(req.body.email)
        .then(({ rows }) => {
            // return compare(req.body.password, rows[0].password).then(
            compare(req.body.password, rows[0].password).then((match) => {
                req.session.userId = rows[0].id;
                if (!rows[0].signature) {
                    res.redirect("/petition");
                } else {
                    req.session.sigId = rows[0].id;
                    res.redirect("/thanks");
                }
                // console.log("ROWWWW----->", rows);
            });
        })
        .catch((e) => {
            // console.log("authentication error2--->", e);
            res.render("login", {
                err: "User not found",
            });
        });
});

app.post("/home/logout", (req, res) => {
    req.session = null;
    res.redirect("/home");
});

app.get("/profile", requireLoggedInUser, (req, res) => {
    res.render("profile");
});

app.post("/profile", requireLoggedInUser, (req, res) => {
    const { age, city, url } = req.body;

    db.registerMoreInfo(req.session.userId, age, city, url)
        .then(() => {
            // console.log(req.session);
            res.redirect("/petition");
        })
        .catch(() => {
            res.render("profile", {
                err: "Invalid information, please try again",
            });
            // console.log("error submitting registration values", err);
            // Re-render the same page with an error message
        });
});
app.post("/profile/deleteuser", (req, res) => {
    db.deleteSignature(req.session.userId)
        .then(() => db.deleteProfile(req.session.userId))
        .then(() => db.deleteUser(req.session.userId))
        .then(() => {
            req.session = null;
            res.redirect("/register");
        })
        .catch((e) => {
            console.log("ERROR deleting profile", e);
            res.render("profile", {
                err: "Profile can not be deleted",
            });
        });
});

app.get("/petition", requireLoggedInUser, requireNoSignature, (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post(
    "/petition",
    requireLoggedInUser,
    requireNoSignature,
    function (req, res) {
        if (req.body.signature !== "") {
            db.signPetition(req.session.userId, req.body.signature)
                .then(({ rows }) => {
                    // console.log("--->>rows in post petition: ", rows);
                    req.session.sigId = rows[0].id;
                    res.redirect("/thanks");
                })
                .catch((e) => {
                    // console.log("erro4--->", e);
                    res.render("petition", {
                        err: "You already signed",
                    });
                });
        } else {
            res.render("petition", {
                err: "Sign to see our current signers",
            });
        }
    }
);

app.get("/thanks", requireLoggedInUser, requireSignature, (req, res) => {
    db.getSignatureByUserId(req.session.userId).then(({ rows }) => {
        res.render("thanks", {
            rows: rows,
        });
    });
});

app.get("/edit", requireLoggedInUser, (req, res) => {
    // console.log("req.session.userId", req.session.userId);
    db.getUserInfo(req.session.userId).then(({ rows }) => {
        console.log("rows--->>", rows);
        res.render("edit", {
            rows: rows,
        });
    });
});

app.post("/edit", (req, res) => {
    db.editUser(
        req.session.userId,
        req.body.first,
        req.body.last,
        req.body.email
    )
        .then(() => {
            db.editUserProfile(
                req.session.userId,
                req.body.age,
                req.body.city,
                req.body.url
            ).then((rows) => {
                console.log("rowss 7 ***-->", rows);
                res.redirect("/edit/done");
            });
        })
        .catch((e) => {
            console.log("error5--->", e);
            res.render("edit", {
                err: "Issues to save new Informations",
            });
        });
});

app.get("/edit/done", (req, res) => {
    console.log("edit done page get");
    res.render("editdone", {
        layout: "main",
    });
});

app.get("/signers", requireLoggedInUser, requireSignature, (req, res) => {
    db.getSignatures().then(({ rows }) => {
        // console.log("ALL SIGNERS ---->", rows.length);

        if (rows[0].url == "") {
            rows[0].url = "home";
        }

        res.render("signers", {
            rows: rows,
        });
    });
});

app.get("/signers/:city", requireSignature, (req, res) => {
    db.signersCity(req.params.city).then(({ rows }) => {
        res.render("signersbycities", {
            rows: rows,
            // layout: "signerscity",
            // link: req.body.url,
        });
    });
});

app.post("/petition/deletesignature", (req, res) => {
    db.deleteSignature(req.session.userId)
        .then(({ rows }) => {
            // console.log("rows.signature----->>>>", req.session.sigId);
            req.session.sigId = null;
            res.redirect("/petition");
        })
        .catch((e) => {
            console.log("error3--->", e);
            res.render("petition", {
                err: "You already signed",
            });
        });
});

app.get("*", (req, res) => {
    res.render("notfound", {
        err: "404 Not Found",
    });
});

app.listen(process.env.PORT || 8080, function () {
    console.log("Listening 8080 🚪👂");
});
