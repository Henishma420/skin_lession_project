const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

const dbName = process.env.DB_NAME || 'tele_derma_db';

// Create connection pool pointed to the database
const pool = mysql.createPool({
  ...dbConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Setup function to verify database and run schema.sql
async function initializeDatabase() {
  let connection;
  try {
    // 1. Connect without database first to ensure database exists
    connection = await mysql.createConnection(dbConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database "${dbName}" verified/created.`);
    await connection.end();

    // 2. Read and run schema.sql to initialize tables and seed data
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Connect to the specific database using multipleStatements: true
      const schemaConn = await mysql.createConnection({
        ...dbConfig,
        database: dbName,
        multipleStatements: true
      });
      
      console.log('⏳ Initializing database tables and seed data from schema.sql...');
      await schemaConn.query(schemaSql);
      console.log('✅ Database tables initialized and seeded successfully.');
      await schemaConn.end();
    } else {
      console.log('⚠️ schema.sql not found, skipping table initialization.');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// Run initialization
(async () => {
  await initializeDatabase();
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database pool successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Pool connection failed:', error.message);
  }
})();

module.exports = pool;
