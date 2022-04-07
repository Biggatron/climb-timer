const query = require('./db');
const fs = require('fs');
const util = require('util');

const connectionString = "postgres://brdrveuq:yrVUAy-dDW9rGvpYujnZZa3XtJTyITAP@manny.db.elephantsql.com/brdrveuq ";

const readFileAsync = util.promisify(fs.readFile);

async function main() {
  console.info(`Set upp gagnagrunn á ${connectionString}`);
  // droppa töflum ef til
  await query('DROP TABLE IF EXISTS user_account CASCADE');
  await query('DROP TABLE IF EXISTS climber CASCADE');
  await query('DROP TABLE IF EXISTS competition CASCADE');
  await query('DROP TABLE IF EXISTS problem CASCADE');
  await query('DROP TABLE IF EXISTS attempt CASCADE');
  await query('DROP TABLE IF EXISTS moderator CASCADE');
 console.info('Töflum eytt');

  // búa til töflur
  try {
    const createTable = await readFileAsync('./schema.sql');
    await query(createTable.toString('utf8'));
    console.info('Töflur búnar til');
  } catch (e) {
    console.error('Villa við að búa til töflur:', e.message);
    return;
  }
  
  try {
    const insert = await readFileAsync('./insert.sql');
    await query(insert.toString('utf8'));
    console.info('Gögnum bætt við');
  } catch (e) {
    console.error('Villa við að bæta gögnum við:', e.message);
  }

}

main().catch((err) => {
    console.error(err);
  });