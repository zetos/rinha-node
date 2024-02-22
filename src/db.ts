import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: '172.17.0.2', //'some-postgres', // 'localhost', //'127.0.0.1',
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

type UpdateResult = { bal: number; lim: number } | null;

const updateClientBalance = (
  clientId: number,
  type: string,
  amount: number,
): Promise<UpdateResult> => {
  // Wrap the database query in a Promise
  return new Promise<UpdateResult>((resolve, reject) => {
    if (type === 'c') {
      pool.query(
        // 'UPDATE client SET bal = CASE WHEN $1 - bal >= lim * -1 THEN bal - $1 ELSE bal END WHERE id = $2 RETURNING bal, lim',
        'UPDATE client SET bal = CASE WHEN 9 >= 100 THEN bal - $1 ELSE bal END WHERE id = $2 RETURNING bal, lim',
        [amount, clientId],
        (error: Error, result: QueryResult<{ bal: number; lim: number }>) => {
          if (error) {
            console.error('Error executing update query:', error);
            reject(error); // Reject the Promise in case of error
          }
          console.log('>>> result:', result);

          if (result.rowCount) {
            console.log('Client updated successfully');
            resolve(result.rows[0]); // Resolve the Promise with the query result
          } else {
            console.log('Client not updated (condition not met)');
            resolve(null); // Resolve with null if no rows were updated
          }
        },
      );
    } else {
      pool.query(
        'UPDATE client SET bal = bal + $1 WHERE id = $2 RETURNING bal, lim',
        [amount, clientId],
        (error: Error, result: QueryResult<{ bal: number; lim: number }>) => {
          if (error) {
            console.error('Error executing update query:', error);
            reject(error); // Reject the Promise in case of error
          }

          console.log('Client updated successfully..');
          console.log('res:', result.rows[0]);
          console.log('>>> result:', result);

          resolve(result.rows[0]); // Resolve the Promise with the query result
        },
      );
    }
  });
};

// update fail result:
// >>> result: Result {
//     command: 'UPDATE',
//     rowCount: 1,
//     oid: null,
//     rows: [ { bal: 864808044, lim: 80000 } ],
//     fields: [
//       Field {
//         name: 'bal',
//         tableID: 16389,
//         columnID: 3,
//         dataTypeID: 23,
//         dataTypeSize: 4,
//         dataTypeModifier: -1,
//         format: 'text'
//       },
//       Field {
//         name: 'lim',
//         tableID: 16389,
//         columnID: 2,
//         dataTypeID: 23,
//         dataTypeSize: 4,
//         dataTypeModifier: -1,
//         format: 'text'
//       }
//     ],
//     _parsers: [ [Function: parseInteger], [Function: parseInteger] ],
//     _types: TypeOverrides {
//       _types: {
//         getTypeParser: [Function: getTypeParser],
//         setTypeParser: [Function: setTypeParser],
//         arrayParser: [Object],
//         builtins: [Object]
//       },
//       text: {},
//       binary: {}
//     },
//     RowCtor: null,
//     rowAsArray: false,
//     _prebuiltEmptyResultObject: { bal: null, lim: null }
//   }

// update success result:
// >>> result: Result {
//     command: 'UPDATE',
//     rowCount: 1,
//     oid: null,
//     rows: [ { bal: 864812044, lim: 80000 } ],
//     fields: [
//       Field {
//         name: 'bal',
//         tableID: 16389,
//         columnID: 3,
//         dataTypeID: 23,
//         dataTypeSize: 4,
//         dataTypeModifier: -1,
//         format: 'text'
//       },
//       Field {
//         name: 'lim',
//         tableID: 16389,
//         columnID: 2,
//         dataTypeID: 23,
//         dataTypeSize: 4,
//         dataTypeModifier: -1,
//         format: 'text'
//       }
//     ],
//     _parsers: [ [Function: parseInteger], [Function: parseInteger] ],
//     _types: TypeOverrides {
//       _types: {
//         getTypeParser: [Function: getTypeParser],
//         setTypeParser: [Function: setTypeParser],
//         arrayParser: [Object],
//         builtins: [Object]
//       },
//       text: {},
//       binary: {}
//     },
//     RowCtor: null,
//     rowAsArray: false,
//     _prebuiltEmptyResultObject: { bal: null, lim: null }
//   }

export { updateClientBalance };
