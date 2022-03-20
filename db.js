const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/cities`);

exports.signPetition = (first, last, sig) => {
    return db.query(
        `INSERT INTO signatures (first, last signature)
        VALUES ($1, $2, $3)`,
        [first, last, sig]
    );
};
