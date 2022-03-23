const spicedPg = require("spiced-pg");
// const request = require("./public/request");
// console.log(request);
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

exports.signPetition = (user_id, sig) => {
    return db.query(
        `INSERT INTO signatures (user_id, signature) VALUES ($1, $2)
        RETURNING id`,
        [user_id, sig]
    );
};

exports.getSignatures = () => {
    return db.query(
        `SELECT users.* FROM signatures JOIN users ON users.id = signatures.user_id`,
        []
    );
};

exports.getSignatureByUserId = (userId) => {
    return db.query(
        `SELECT signature FROM signatures
    WHERE user_id = $1`,
        [userId]
    );
};

exports.registerUser = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password ) VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [first, last, email, password]
    );
};

exports.authenticateUser = (email) => {
    return db.query(
        `SELECT password FROM users
    WHERE email = $1`,
        [email]
    );
};
