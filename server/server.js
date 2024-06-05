const app = require('./app.js');

const SERVER_PORT = 3000;


app().server.listen(SERVER_PORT, () => {
    console.log(`Server started on http://localhost:${SERVER_PORT}`);
}
);
