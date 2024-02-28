import { Pool, QueryResult } from 'pg';

type UpdateResult = { bal?: number; lim?: number; updated: boolean };

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
  user: 'admin',
  host: process.env.DB_HOSTNAME || 'localhost',
  database: 'rinha',
  password: '123',
  port: 5432,
});

const transactionUpdateBalance = async (
  clientId: number,
  type: string,
  amount: number,
  description: string,
): Promise<UpdateResult> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result: QueryResult<{
      bal: number;
      lim: number;
    }> = await client.query(
      `WITH inserted_transaction AS (
          INSERT INTO transaction (cid, amount, type, descr)
        VALUES ($2, $1, $3, $4)
        )
        UPDATE client
          SET bal = bal ${type === 'd' ? '-' : '+'} $1
          WHERE id = $2
          RETURNING bal, lim
        `,
      [amount, clientId, type, description],
    );

    await client.query('COMMIT');

    const { bal, lim } = result.rows[0];

    return { bal, lim, updated: true };
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error, rollingback.', e);
    return { updated: false };
  } finally {
    // console.log('finally');
    client.release();
  }
};

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
    ),
    latest_transactions AS (
        SELECT *
        FROM transaction
        WHERE cid = $1
        ORDER BY c_at DESC
        LIMIT 10
    )
    SELECT cb.bal, cb.lim, NOW() as current_time,
           json_agg(json_build_object(
               'valor', lt.amount,
               'tipo', lt.type,
               'realizada_em', lt.c_at,
               'descricao', lt.descr
           )) AS transactions
    FROM client_balance cb
    LEFT JOIN latest_transactions lt ON true
    GROUP BY cb.bal, cb.lim;`,
      [clientId],
    );

    return rows[0] as BalanceAndTransactions;
  } finally {
    client.release();
  }
};

export { transactionUpdateBalance, getBalance };
