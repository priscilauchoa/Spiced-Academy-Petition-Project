const bcrypt = require("bcryptjs");
//bc é um module

// call hash pass user password
exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

exports.compare = bcrypt.compare;
