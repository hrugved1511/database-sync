const { Pool } = require('pg');

const poolTargetDB = new Pool({
    connectionString: 'postgresql://postgres:pass123@localhost:5432/TargetDB',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = poolTargetDB;