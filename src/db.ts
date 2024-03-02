import postgres from 'postgres';

type UpdateResult = { bal?: number; lim?: number; updated: boolean };

interface BalanceAndTransactions {
  bal: number;
  lim: number;
  transactions: Transaction[];
  current_time: Date;
}

interface Transaction {
  valor: number;
  tipo: string;
  realizada_em: Date;
  descricao: string;
}

const sql = postgres({
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
  try {
    const result = await sql`WITH inserted_transaction AS (
          INSERT INTO transaction (cid, amount, type, descr)
        VALUES (${clientId}, ${amount}, ${type}, ${description})
        )
        UPDATE client
          SET bal = bal ${type === 'd' ? sql`-` : sql`+`} ${amount}
          WHERE id = ${clientId}
          RETURNING bal, lim
        `;

    return { bal: result[0].bal, lim: result[0].lim, updated: true };
  } catch (e) {
    return { updated: false };
  }
};

const getBalance = async (
  clientId: number,
): Promise<BalanceAndTransactions> => {
  try {
    const result = await sql`
    WITH latest_transactions AS (
        SELECT cid, amount, type, c_at, descr
        FROM transaction
        WHERE cid = ${clientId}
        ORDER BY c_at DESC
        LIMIT 10
    )
    SELECT c.bal, c.lim, NOW() as current_time,
           json_agg(json_build_object(
               'valor', lt.amount,
               'tipo', lt.type,
               'realizada_em', lt.c_at,
               'descricao', lt.descr
           )) AS transactions
    FROM client c
    INNER JOIN latest_transactions lt ON c.id = lt.cid
    WHERE c.id = ${clientId}
    GROUP BY c.bal, c.lim;`;

    return result[0] as BalanceAndTransactions;
  } catch (e) {
    throw e;
  }
};

export { transactionUpdateBalance, getBalance };
