const { config } = require('dotenv');
config('./.env');

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  env: {
    INFURA_ID: process.env.INFURA_ID,
  },
  future: {
    webpack5: true,
  },
};
