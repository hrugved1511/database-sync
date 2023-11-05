const cron = require('node-cron');
// const { poolTargetDB } = require('./config/targetDB.connection');
// const { poolSourceDB } = require('./config/sourceDB.connection');
const { Pool } = require('pg');

const poolSourceDB = new Pool({
    connectionString: 'postgresql://postgres:pass123@localhost:5432/SourceDB'
});

const poolTargetDB = new Pool({
    connectionString: 'postgresql://postgres:pass123@localhost:5432/TargetDB'
});


async function getCommonTables() {
    try {

       
        const querySource = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%configuration'";
        const queryTarget = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%configuration'";
        
        const { rows: rowsSource } = await poolSourceDB.query(querySource);
        const { rows: rowsTarget } = await poolTargetDB.query(queryTarget);
    
        const commonTables = rowsSource.filter(rowsSource => rowsTarget.some(rowsTarget => rowsTarget.table_name === rowsSource.table_name));

        console.log(commonTables)
        return commonTables;
      } catch (error) {
        console.error('Error getting common table names:', error);
        return [];
      }
}

async function synchronizeData(tableName) {
    try {
        const syncQuery = `SELECT * FROM ${tableName} WHERE sync = true`;
    
        const { rows } = await poolSourceDB.query(syncQuery);

        console.log("Rows in sourceDB: ", rows)
    
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = columns.map(column => row[column]);
    
          const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')})`;
          await poolTargetDB.query(insertQuery, values);

          await poolSourceDB.query(`UPDATE ${tableName} SET sync = false WHERE id = ${row.id}`);
        }
    
        console.log(`Synchronized data for table ${tableName}`);
      } catch (error) {
        console.error(`Data synchronization failed for table ${tableName}:`, error);
      }
}

async function cronSchedule () {

   
        console.log('Starting data synchronization...');
      
        const commonTables = await getCommonTables();
       await commonTables.forEach(table => {
            console.log("Starting data synchronization for table: ", table.table_name);
          synchronizeData(table.table_name);
        });
      
        console.log('Data synchronization complete.');
  

}

module.exports = cronSchedule;


