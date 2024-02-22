import { Pool, QueryResult } from 'pg';

type UpdateResult = { bal: number; lim: number; updated: boolean };

interface BalanceAndTransactions {
  bal: number;
  lim: number;
  transactions: Transaction[];
  current_time: Date;
}

interface Transaction {
  id: number;
  cid: number;
  amount: number;
  type: string;
  c_at: Date;
  descr: string;
}

const pool = new Pool({
  user: 'postgres',
  host: '172.17.0.2',
  database: 'postgres',
  password: 'mysecretpassword',
  port: 5432,
});

const transactionUpdateBalance = async (
  clientId: number,
  type: string,
  amount: number,
  desciption: string,
): Promise<UpdateResult> => {
  const client = await pool.connect();

  if (type === 'c') {
    try {
      await client.query('BEGIN');

      const result: QueryResult<{
        bal: number;
        lim: number;
        updated: boolean;
      }> = await client.query(
        `UPDATE client
      SET bal = CASE WHEN bal - $1 >= lim * -1 THEN bal - $1 ELSE bal END
      WHERE id = $2
      RETURNING bal, lim, bal - $1 >= lim * -1 AS updated;
      `,
        [amount, clientId],
      );

      const { updated } = result.rows[0];

      if (updated) {
        // Insert a new transaction record
        await client.query(
          `INSERT INTO transaction (cid, amount, type, descr)
          VALUES ($1, $2, $3, $4);
          `,
          [clientId, amount, type, desciption],
        );
      }

      await client.query('COMMIT');

      return result.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error, rollingback.');
      throw e;
    } finally {
      console.log('finally');
      client.release();
    }
  } else {
  }

  try {
    await client.query('BEGIN');

    const result: QueryResult<{ bal: number; lim: number; updated: boolean }> =
      await client.query(
        `UPDATE client
    SET bal = bal + $1
    WHERE id = $2
    RETURNING bal, lim, true AS updated;
    `,
        [amount, clientId],
      );

    await client.query(
      `INSERT INTO transaction (cid, amount, type, descr)
        VALUES ($1, $2, $3, $4);
        `,
      [clientId, amount, type, desciption],
    );

    await client.query('COMMIT');

    const { bal, lim, updated } = result.rows[0];
    console.log('updated:', updated);

    return { bal, lim, updated: true };
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error, rollingback.');
    throw e;
  } finally {
    console.log('finally');
    client.release();
  }
};

// TODO: test with manual lock.

//     await client.query(
//       'BEGIN; SELECT pg_advisory_xact_lock($1); UPDATE client SET balance = balance + 100 WHERE client_id = $1; COMMIT;',
//       [clientID],
//     );

const getBalance = async (
  clientId: number,
): Promise<BalanceAndTransactions> => {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      `WITH client_balance AS (
       SELECT bal, lim
       FROM client
       WHERE id = $1
     )
     SELECT cb.bal, cb.lim, NOW() as current_time, json_agg(json_build_object('valor', t.amount, 'tipo', t.type, 'realizada_em', t.c_at, 'descricao', t.descr)) AS transactions
     FROM client_balance cb
     LEFT JOIN (
       SELECT *
       FROM transaction
       WHERE cid = $1
       ORDER BY c_at DESC
       LIMIT 10
     ) t ON true
     GROUP BY cb.bal, cb.lim`,
      [clientId],
    );

    return rows[0] as BalanceAndTransactions;
  } finally {
    client.release();
  }
};

export { transactionUpdateBalance, getBalance };
