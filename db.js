const spicedPg = require("spiced-pg");
// const request = require("./public/request");
// console.log(request);
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

exports.signPetition = (first, last, sig) => {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)
        RETURNING id`,
        [first, last, sig]
    );
};

exports.getPetition = (id) => {
    return db.query(
        `SELECT * FROM signatures
    WHERE id = $1`,
        [id]
    );
};

// exports.getPetition = (first, last) => {
//     console.log("--->> getPetition", first, last);
//     return db
//         .query(
//             `SELECT * FROM signatures
//         WHERE first = $1
//         AND last = $2`,
//             [first, last]
//         )
//         .then(({ rows }) => console.log("---->>rows", rows[0]))
//         .catch((err) => console.log("ERROR!", err.message));
// };

// INSERT INTO signature (signature) VALUES ($1) RETURNING id;
