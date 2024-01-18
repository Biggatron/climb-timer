const query = require('./db');
const keys = require('../config/keys');

const connectionString = keys.postgres.connectionString;

async function main() {
  console.info(`Adding columns to database using connection string: ${connectionString}`);

  // Add columns
  try {
    await query(
      'ALTER TABLE timer ADD COLUMN main_color char(7)'
    );
    await query(
      'ALTER TABLE timer ADD COLUMN secondary_color char(7)'
    );
    await query(
      'ALTER TABLE timer ADD COLUMN buffer_color char(7)'
    );
    await query(
      'ALTER TABLE timer ADD COLUMN visit_count integer default 0'
    );
    await query(
      'ALTER TABLE timer ADD COLUMN last_visit_time timestamp default current_timestamp'
    );
  } catch (e) {
    console.error('Error while adding columns', e.message)
  }
  console.info('Columns added to database')
}

main().catch((err) => {
    console.error(err);
  });