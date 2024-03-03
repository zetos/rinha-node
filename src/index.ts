import process from 'node:process';
import { App } from 'uWebSockets.js';

import { getBalance, transactionUpdateBalance } from './db';
import { Type as t, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const Post = t.Object({
  valor: t.Integer(),
  tipo: t.Union([t.Literal('c'), t.Literal('d')]),
  descricao: t.String({ minLength: 1, maxLength: 10 }),
});

type Transaction = Static<typeof Post>;

const app = App();

const handleArrayBuffer = (data: ArrayBuffer | string): Transaction => {
  if (data instanceof ArrayBuffer) {
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(data));
  }
  return JSON.parse(data); // 🙈
};

app.post('/clientes/:id/transacoes', async (res, req) => {
  res.onAborted(() => {
    console.info('Request aborted');
    res.writeStatus('400').end();
  });

  const clientId = +req.getParameter(0);
  res.onData(async (data) => {
    const bodyData = handleArrayBuffer(data);

    if (Value.Check(Post, bodyData)) {
      const result = await transactionUpdateBalance(
        clientId,
        bodyData.tipo,
        bodyData.valor,
        bodyData.descricao,
      );

      res.cork(() => {
        if (result.updated) {
          res.writeHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              limite: result.lim,
              saldo: result.bal,
            }),
          );
        } else {
          res.writeStatus('422').end();
        }
      });
    } else {
      res.cork(() => {
        res.writeStatus('400').end();
      });
    }
  });
});

// extract
app.get('/clientes/:id/extrato', async (res, req) => {
  res.onAborted(() => {
    console.info('Request aborted');
  });

  const clientId = +req.getParameter(0);
  try {
    const balance = await getBalance(clientId);

    if (!balance) {
      throw new Error('Not Found');
    }

    res.cork(() => {
      res.writeHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          saldo: {
            total: balance.bal,
            data_extrato: balance.current_time,
            limite: balance.lim,
          },
          ultimas_transacoes: balance.transactions[0].tipo
            ? balance.transactions
            : [],
        }),
      );
    });
  } catch (e) {
    console.error('caugh !!', e);
    res.cork(() => {
      res.writeStatus('404').end('Not Found');
    });
  }
});

const port = Number(process.env.PORT) || 3001;

app.listen(port, async (listenSocket) => {
  if (listenSocket) {
    console.info(
      `uws server is listening at http://0.0.0.0:${port}`,
      listenSocket,
    );
  }
});
