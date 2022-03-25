module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect("/petition");
    }

    next();
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }

    next();
};

module.exports.requireNoSignature = (req, res, next) => {
    if (req.session.sigId) {
        return res.redirect("/thanks");
    }
    next();
};

module.exports.requireSignature = (req, res, next) => {
    if (!req.session.sigId) {
        return res.redirect("/petition");
    }

    next();
};
