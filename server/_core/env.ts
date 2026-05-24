export const ENV = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  ownerOpenId: process.env.OWNER_OPEN_ID || '',
};
