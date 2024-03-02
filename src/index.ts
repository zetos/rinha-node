import Fastify from 'fastify';
import process from 'node:process';

import { getBalance, transactionUpdateBalance } from './db';

const fastify = Fastify({
  logger: false,
});

interface Params {
  id: number;
}

interface Transaction {
  valor: number;
  tipo: 'c' | 'd';
  descricao: string;
}

const tBodySchema = {
  type: 'object',
  required: ['valor', 'tipo', 'descricao'],
  properties: {
    valor: { type: 'integer', minimum: 0 },
    tipo: { type: 'string', enum: ['c', 'd'] },
    descricao: { type: 'string', minLength: 1, maxLength: 10 },
  },
};

fastify.post<{ Params: Params }>(
  '/clientes/:id/transacoes',
  {
    schema: {
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: tBodySchema,
    },
  },
  async (req, res) => {
    const { id } = req.params;
    const clientId: number = Number(id);
    // if (clientId < 0) { // cheat and add a clientId > 5 check?
    //     reply.code(404).send({ error: 'Not Found' });
    // }

    const bodyData = req.body as Transaction;

    const result = await transactionUpdateBalance(
      clientId,
      bodyData.tipo,
      bodyData.valor,
      bodyData.descricao,
    );

    if (result.updated) {
      return res.code(200).send({
        limite: result.lim,
        saldo: result.bal,
      });
    } else {
      return res.code(422).send();
    }
  },
);

// extract
fastify.get<{ Params: Params }>(
  '/clientes/:id/extrato',
  {
    schema: {
      params: { type: 'object', properties: { id: { type: 'integer' } } },
    },
  },
  async (req, res) => {
    const { id } = req.params;
    const clientId: number = Number(id);
    // if (clientId < 0) { // cheat and add a clientId > 5 check?
    //     reply.code(404).send({ error: 'Not Found' });
    // }

    const balance = await getBalance(clientId);

    if (!balance) {
      return res.code(404).send();
    }

    return res.code(200).send({
      saldo: {
        total: balance.bal,
        data_extrato: balance.current_time,
        limite: balance.lim,
      },
      ultimas_transacoes: balance.transactions[0].tipo
        ? balance.transactions
        : [],
    });
  },
);

const port = Number(process.env.PORT) || 3001;
fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.info(`Fastify server is listening at http://0.0.0.0:${port}`);
});
