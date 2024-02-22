import Fastify from 'fastify';
import { transactionUpdateBalance } from './db';

const fastify = Fastify({
  logger: true,
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

    console.log('Client id:', clientId);
    console.log('Client bodyData:', bodyData);

    const result = await transactionUpdateBalance(
      clientId,
      bodyData.tipo,
      bodyData.valor,
      bodyData.descricao,
    );

    console.log('result:', result);
    if (result.updated) {
      res.code(200).send({
        limite: result.lim,
        saldo: result.bal,
      });
    } else {
      res.code(422).send();
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
  (req, res) => {
    const { id } = req.params;
    const clientId: number = Number(id);
    // if (clientId < 0) { // cheat and add a clientId > 5 check?
    //     reply.code(404).send({ error: 'Not Found' });
    // }

    console.log('Client id:', clientId);

    res.code(200).send({
      saldo: {
        total: -9098,
        data_extrato: '2024-01-17T02:34:41.217753Z',
        limite: 100000,
      },
      // last 10
      ultimas_transacoes: [
        {
          valor: 10,
          tipo: 'c',
          descricao: 'descricao',
          realizada_em: '2024-01-17T02:34:38.543030Z',
        },
        {
          valor: 90000,
          tipo: 'd',
          descricao: 'descricao',
          realizada_em: '2024-01-17T02:34:38.543030Z',
        },
      ],
    });
  },
);

const port = Number(process.env.PORT) || 3001;
// Run the server!
fastify.listen({ port }, (err) => {
  if (err) throw err;
  // Server is now listening on ${address}
  console.info(`Fastify server is listening at http://localhost:${port}`);
});
