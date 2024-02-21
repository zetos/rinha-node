import Fastify from 'fastify';
import crypto from 'crypto';

const fastify = Fastify({
  logger: false,
});

interface Users {
  [key: string]: { salt: string; hash: Buffer };
}

const users: Users = {};

fastify.get('/newUser', (req, res) => {
  let username = (req.query as { username?: string }).username || '';
  const password = (req.query as { password?: string }).password || '';

  username = username.replace(/[!@#$%^&*]/g, '');

  if (!username || !password || users[username]) {
    return res.code(400).send();
  }

  const salt = crypto.randomBytes(128).toString('base64');

  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512');
  users[username] = { salt, hash };

  res.code(200).send();
});

fastify.get('/auth', (req, res) => {
  let username = (req.query as { username?: string }).username || '';
  const password = (req.query as { password?: string }).password || '';

  username = username.replace(/[!@#$%^&*]/g, '');

  if (!username || !password || !users[username]) {
    return res.code(400).send();
  }

  crypto.pbkdf2(
    password,
    users[username].salt,
    10000,
    512,
    'sha512',
    (err, hash) => {
      if (users[username].hash.toString() === hash.toString()) {
        res.code(200).send();
      } else {
        res.code(401).send();
      }
    },
  );
});

const port = 3001;
// Run the server!
fastify.listen({ port }, (err) => {
  if (err) throw err;
  // Server is now listening on ${address}
  console.info(`Fastify server is listening at http://localhost:${port}`);
});
