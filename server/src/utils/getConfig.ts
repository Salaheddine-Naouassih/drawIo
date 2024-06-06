import dotenv from "dotenv";

dotenv.config();

export const getConfig = () => ({
  PORT: process.env.PORT || 3000,
  SOCKET_PORT: process.env.SOCKET_PORT || 3001,
});
