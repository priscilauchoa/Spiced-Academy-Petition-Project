const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/geography`);

function getCityByName(name, country) {
    return db
        .query(
            `SELECT * FROM cities
    WHERE name = $1 AND country = $2`,
            [name, country]
        )
        .then(({ rows }) => {
            console.log(rows);
        })
        .catch((err) => console.log("error", err.message));

    
}




getCityByName("Pri");
