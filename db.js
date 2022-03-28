const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

exports.signPetition = (user_id, sig) => {
    return db.query(
        `INSERT INTO signatures (user_id, signature) VALUES ($1, $2)
        RETURNING id`,
        [user_id, sig]
    );
};

exports.updateSignature = (user_id, sig) => {
    return db.query(
        `UPDATE signatures SET signature = $2 WHERE signatures.user_id = $1      
        RETURNING id`,
        [user_id, sig]
    );
};

exports.signPetitionLater = (user_id, sig) => {
    return db.query(
        `INSERT INTO signatures (signature) VALUES ($2)
        WHERE signatures.user_id $1`,
        [user_id, sig]
    );
};

exports.signersCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM signatures JOIN users ON users.id = signatures.user_id JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(city) = LOWER ($1)`,
        [city]
    );
};

exports.getSignatures = () => {
    return db.query(
        `SELECT * FROM users JOIN signatures ON users.id = signatures.user_id JOIN user_profiles ON users.id = user_profiles.user_id`,
        []
    );
};
exports.getUserInfo = (id) => {
    return db.query(
        `SELECT * FROM users JOIN signatures ON users.id = signatures.user_id JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id = $1`,
        [id]
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

exports.registerMoreInfo = (user_id, age, city, homepage) => {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url ) VALUES ($1, $2, $3, $4)`,
        [user_id, age, city, homepage]
    );
};

// exports.getUserInfo = (user_id) => {
//     return db.query(
//         `SELECT * FROM users JOIN signatures ON users.id = signatures.user_id JOIN user_profiles ON users.id = user_profiles.user_id`,
//         [user_id]
//     );
// };

exports.deleteSignature = (user_id) => {
    return db.query(`DELETE FROM signatures WHERE signatures.user_id = $1`, [
        user_id,
    ]);
};
exports.deleteProfile = (user_id) => {
    return db.query(
        `DELETE FROM user_profiles WHERE user_profiles.user_id = $1`,
        [user_id]
    );
};

exports.deleteUser = (user_id) => {
    return db.query(`DELETE FROM users WHERE id = $1`, [user_id]);
};

exports.authenticateUser = (email) => {
    return db.query(
        `SELECT users.password, users.id, signatures.signature AS signature
FROM users
FULL JOIN signatures
ON users.id = signatures.user_id
WHERE users.email = $1`,
        [email]
    );
};
