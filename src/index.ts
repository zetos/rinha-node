import Fastify from 'fastify';

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
  (req, res) => {
    const { id } = req.params;
    const clientId: number = Number(id); // TODO: check if it is a number
    // if (clientId < 0) { // cheat and add a clientId > 5 check?
    //     reply.code(404).send({ error: 'Not Found' });
    // }

    // const { valor, tipo, descricao } = req.body as Transaction;

    const bodyData = req.body as Transaction;

    console.log('Client id:', clientId);
    console.log('Client bodyData:', bodyData);

    // limite deve ser o limite cadastrado do cliente.
    // saldo deve ser o novo saldo após a conclusão da transação.

    res.code(200).send({
      limite: 100000,
      saldo: -9098,
    });
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
    const clientId: number = Number(id); // TODO: check if it is a number
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
