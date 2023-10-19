const query = require('./db');
const keys = require('../config/keys');

const connectionString = keys.postgres.connectionString;

async function main() {
  console.info(`Adding columns to database using connection string: ${connectionString}`);

  // Add columns
  try {
    await query(
      'ALTER TABLE user_account ADD COLUMN hashed_password bytea'
    );
    await query(
      'ALTER TABLE user_account ADD COLUMN salt bytea'
    );
  } catch (e) {
    console.error('Error while adding columns', e.message)
  }
  console.info('Columns added to database')
}

main().catch((err) => {
    console.error(err);
  });