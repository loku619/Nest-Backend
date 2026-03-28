const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: 'root' });
    const [rows] = await conn.query("SHOW DATABASES LIKE 'user_api_db'");
    console.log('found', rows.length);
    if (rows.length === 0) {
      await conn.query("CREATE DATABASE IF NOT EXISTS user_api_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
      console.log('created');
    }
    const [rows2] = await conn.query("SHOW DATABASES LIKE 'user_api_db'");
    console.log(rows2);
    await conn.end();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();