const db = require("./db");
const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const secrets = require("./secret");
const cookieSession = require("cookie-session");
const { compare, hash } = require("./bc");
const {
    requireLoggedOutUser,
    requireLoggedInUser,
    requireNoSignature,
    requireSignature,
} = require("./middleware");

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
    hash(password)
        .then((hashedPassword) => {
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

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    const { age, city, homepage } = req.body;

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
                    // zconsole.log("--->>rows in post petition: ", rows);
                    req.session.sigId = rows[0].id;
                    res.redirect("/thanks");
                })
                .catch((e) => {
                    // console.log("error3--->", e);
                    res.render("petition", {
                        err: "You already signed",
                    });
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

app.get("/edit", requireLoggedInUser, requireSignature, (req, res) => {
    console.log("req.session.userId", req.session.userId);
    db.getUserInfo(req.session.userId).then(({ rows }) => {
        res.render("edit", {
            rows: rows,
        });
    });
});

app.get("/signers", requireSignature, (req, res) => {
    db.getSignatures().then(({ rows }) => {
        // console.log("ALL SIGNERS ---->", rows.length);
        res.render("signers", {
            rows: rows,
        });
    });
});

app.get("/signers/:city", requireSignature, (req, res) => {
    db.signersCity(req.params.city).then(({ rows }) => {
        res.render("signersbycities", {
            rows: rows,
            layout: "signerscity",
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

app.listen(process.env.PORT || 8080, function () {
    console.log("Listening 8080 🚪👂");
});

// app.listen(8080, console.log("Listening 8080 🚪👂"));
// if (!(req.session.user.signatureId{
//     return res.redirect(/petition)
// }))
