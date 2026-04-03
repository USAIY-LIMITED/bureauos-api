export default () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackCallBackUrl: process.env.PAYSTACK_CALLBACK_URL,
  paystackUrl: process.env.PAYSTACK_URL,
  monnifyAPIKey: process.env.MONNIFY_API_KEY,
  monnifySecretKey: process.env.MONNIFY_SECRET_KEY,
  monnifyTestBaseURL: process.env.MONNIFY_TEST_BASE_URL,
});
