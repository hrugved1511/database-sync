const { Pool } = require('pg');

const poolSourceDB = new Pool({
    connectionString: 'postgresql://postgres:pass123@localhost:5432/SourceDB',
    ssl: {
        rejectUnauthorized: false
    }
});


console.log("Source DB connection string: ", poolSourceDB)


module.exports = poolSourceDB;