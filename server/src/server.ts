import { startServer } from "./app";
import { getConfig } from "./utils/getConfig";

const main = () => {
  const { app, server } = startServer();
  const { PORT, SOCKET_PORT } = getConfig();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.listen(SOCKET_PORT, () => {
    console.log(`Socket running on http://localhost:${SOCKET_PORT}`);
  });
};

main();
