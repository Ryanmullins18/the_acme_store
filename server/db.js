const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store_db"
);

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorite;
    DROP TABLE IF EXISTS product;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users(
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
    );

    CREATE TABLE product(
    id UUID PRIMARY KEY, 
    name VARCHAR(100) NOT NULL
    );

    CREATE TABLE favorite(
    id UUID PRIMARY KEY, 
    product_id UUID REFERENCES product(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    CONSTRAINT unique_product_users UNIQUE (product_id, user_id)
    );
    `;
  await client.query(SQL);
};

const createProduct = async ({ name }) => {
  const SQL = `INSERT INTO product(id, name) VALUES($1, $2) RETURNING *;`;

  const response = await client.query(SQL, [uuid.v4(), name]);

  return response.rows[0];
};

const createUser = async ({ name, password }) => {
  const SQL = `INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;`;

  const hashedPassword = await bcrypt.hash(
    password,
    process.env.SALT_ROUNDS || 5
  );

  const response = await client.query(SQL, [uuid.v4(), name, hashedPassword]);

  return response.rows[0];
};

const createFavorite = async ({ user_id, product_id }) => {
  const SQL = `INSERT INTO favorite(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *;`;

  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);

  return response.rows[0];
};

const destroyFavorite = async ({ id, user_id }) => {
  const SQL = `DELETE FROM favorite WHERE id=$1 AND user_id=$2;`;

  await client.query(SQL, [id, user_id]);
};

const fetchProducts = async () => {
  const SQL = `SELECT * FROM product;`;

  const response = await client.query(SQL);

  return response.rows;
};

const fetchUsers = async () => {
  const SQL = `SELECT * FROM users;`;

  const response = await client.query(SQL);

  return response.rows;
};

const fetchFavorite = async ({ user_id }) => {
  const SQL = `SELECT * FROM favorite WHERE user_id=$1;`;

  const response = await client.query(SQL, [user_id]);

  return response.rows;
};

module.exports = {
  client,
  createProduct,
  createTables,
  createUser,
  createFavorite,
  destroyFavorite,
  fetchProducts,
  fetchFavorite,
  fetchUsers,
};