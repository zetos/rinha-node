import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: 'mysecretpassword',
  port: 5432, // default PostgreSQL port
});

// TODO: test with manual lock.
// (async () => {
//   const client = await pool.connect();

//   try {
//     // Begin a transaction, acquire advisory lock, and perform the update operation
//     await client.query(
//       'BEGIN; SELECT pg_advisory_xact_lock($1); UPDATE client SET balance = balance + 100 WHERE client_id = $1; COMMIT;',
//       [clientID],
//     );

//     console.log('Update operation with advisory lock completed successfully');
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     // Release the client back to the pool
//     client.release();
//   }
// })();

const updateClientBalance = (
  clientId: number,
  type: string,
  amount: number,
) => {
  if (type === 'c') {
    return pool.query(
      'UPDATE client SET bal = CASE WHEN $1 >= -lim THEN bal - $1 ELSE bal END WHERE id = $2',
      [amount, clientId],
      (error, result) => {
        if (error) {
          console.error('Error executing update query:', error);
          return;
        }

        if (result.rowCount) {
          console.log('Client updated successfully');
        } else {
          console.log('Client not updated (condition not met)');
        }
      },
    );
  } else {
    return pool.query(
      'UPDATE client SET bal = bal + $1 WHERE id = $2',
      [amount, clientId],
      (error, result) => {
        if (error) {
          console.error('Error executing update query:', error);
          return;
        }

        if (result.rowCount) {
          console.log('Client updated successfully');
        } else {
          console.log('Client not updated (condition not met)');
        }
      },
    );
  }
};

export { updateClientBalance };
