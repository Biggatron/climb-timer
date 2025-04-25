const query = require('./db');
const keys = require('../config/keys');

const connectionString = keys.postgres.connectionString;

async function main() {
  console.info(`Adding columns to database using connection string: ${connectionString}`);

  // Add columns
  try {
    /* await query(
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
    await query(
      'ALTER TABLE timer ALTER COLUMN time_elapsed TYPE bigint'
    );
    await query(
      'ALTER TABLE timer ALTER COLUMN time_elapsed SET DEFAULT 0'
    );*/ 
    await query(
      'ALTER TABLE user_account ADD COLUMN is_admin boolean default false'
    );
    await query(
      "UPDATE user_account SET is_admin = true WHERE email = 'birgir.snorrason@gmail.com'"
    );
  } catch (e) {
    console.error('Error while adding columns', e.message)
  }
  console.info('Columns added to database')
}

main().catch((err) => {
    console.error(err);
  });