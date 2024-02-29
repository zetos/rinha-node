// db.createCollection('client', {
//   validator: {
//     $jsonSchema: {
//       bsonType: 'object',
//       required: ['lim', 'name'],
//       properties: {
//         id: {
//           bsonType: 'objectId',
//           description: 'The unique identifier for the client',
//         },
//         lim: {
//           bsonType: 'int',
//           description: 'The limit for the client',
//         },
//         bal: {
//           bsonType: 'int',
//           description: 'The balance for the client, defaults to 0',
//           default: 0,
//         },
//         name: {
//           bsonType: 'string',
//           description: 'The name of the client',
//         },
//       },
//       // Custom validation rule for balance_limit
//       validationAction: 'error', // Optional: action when validation fails
//       validationLevel: 'moderate', // Optional: validation level
//       $expr: {
//         $gte: ['$bal', { $multiply: ['$lim', -1] }],
//       },
//     },
//   },
// });

// Define the database name
const dbName = 'rinha';

// Switch to the specified database
db = db.getSiblingDB(dbName);

db.client.createIndex({ id: 1 }, { unique: true });

db.client.insertMany([
  { bal: 0, id: 1, name: 'o barato sai caro', lim: 1000 * 100 },
  { bal: 0, id: 2, name: 'zan corp ltda', lim: 800 * 100 },
  { bal: 0, id: 3, name: 'les cruders', lim: 10000 * 100 },
  { bal: 0, id: 4, name: 'padaria joia de cocaia', lim: 100000 * 100 },
  { bal: 0, id: 5, name: 'kid mais', lim: 5000 * 100 },
]);
