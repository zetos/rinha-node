import { Db, MongoClient } from 'mongodb';

type UpdateResult = { bal?: number; lim?: number; updated: boolean };

interface BalanceAndTransactions {
  bal: number;
  lim: number;
  transactions: Transaction[];
  current_time: Date;
}

interface Transaction {
  amount: number;
  type: string;
  c_at: Date;
  descr: string;
}

interface Client {
  _id: string;
  id: number;
  lim: number;
  bal: number;
  name: string;
  transactions: Transaction[];
}

const client = new MongoClient('mongodb://admin:123@db:27017');

let db: Db;

async function connectDatabase(): Promise<void> {
  try {
    await client.connect();
    console.info('Connected to mongodb');
    db = client.db('rinha');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

async function disconnectDatabase(): Promise<void> {
  try {
    await client.close();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
}

const transactionUpdateBalance = async (
  clientId: number,
  type: string,
  amount: number,
  description: string,
): Promise<UpdateResult> => {
  // await client.connect();
  // const db = client.db('rinha');

  try {
    const c = (await db
      .collection('client')
      .findOne<Client>({ id: clientId })) as Client | null;

    if (!c) {
      throw new Error('Client not found');
    }

    const newBalance = type === 'd' ? c.bal - amount : c.bal + amount;

    if (newBalance < -c.lim) {
      throw new Error('New balance violates balance limit constraint');
    }

    const updatedClient = await db
      .collection<Client>('client')
      .findOneAndUpdate(
        { id: clientId },
        {
          $inc: { bal: type === 'd' ? -amount : amount },
          $push: {
            transactions: {
              amount: amount,
              type: type, // Assuming this is a credit transaction, adjust as needed
              descr: description, // Replace with actual description
              c_at: new Date(), // Set created_at to current date and time
            },
          },
        },
        { returnDocument: 'after' },
      );

    return { bal: updatedClient!.bal, lim: updatedClient!.lim, updated: true };
  } catch (e) {
    console.error('Error:', e);
    // await disconnectDatabase();
    return { updated: false };
  }
};

const getBalance = async (
  clientId: number,
): Promise<BalanceAndTransactions> => {
  // await client.connect();
  // const db = client.db('rinha');

  try {
    const c = await db.collection('client').findOne<Client>(
      { id: clientId },
      {
        projection: {
          id: 1,
          lim: 1,
          bal: 1,
          name: 1,
          transactions: {
            $slice: -10, // Limit to the last 10 transactions
          },
        },
        sort: { 'transactions.c_at': 1 },
      },
    );

    if (!c) {
      throw new Error('Client not found');
    }

    const sortedAndLimitedTransactions = c.transactions
      ? c.transactions.sort((a, b) => b.c_at.getTime() - a.c_at.getTime())
      : [];

    return {
      bal: c.bal,
      lim: c.lim,
      current_time: new Date(),
      transactions: sortedAndLimitedTransactions,
    };
  } catch (e) {
    console.error('err:', e);
    // await disconnectDatabase();
    throw new Error('getBalance error.');
  }
  // finally {
  //   await client.close();
  // }
};

export {
  transactionUpdateBalance,
  getBalance,
  connectDatabase,
  disconnectDatabase,
};
