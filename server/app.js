const
    http = require("http"),
    express = require("express"),
    socketio = require("socket.io")
uuid = require("uuid");

const SERVER_PORT = 3000;




function startServer() {
    // create a new express app
    const app = express();
    const server = http.createServer(app);
    const io = socketio(server);


    app.use(express.static("../client"));


    io.on("connection", (socket) => {


        socket.on("join_room", (data) => {
            console.log("Joining room", data.room);
            socket.join(data.room);
        });

        socket.on("coordinates", (data) => {
            try {
                io.to(data.room).emit("draw", data)
            } catch (e) {
                console.log(e);
            }
        });

        socket.on("message", (data) => {
            io.to(data.room).emit("message", data.message);
        });

    });


    app.post("/room", (req, res) => {
        const roomId = uuid.v4();
        res.json({ url: `/room.html?roomId=${roomId}` });
    })

    app.get("/:roomId", (req, res) => {
        const roomId = req.params.roomId;
        res.redirect(`/room.html?roomId=${roomId}`);
    });

    return { server, app };
}

module.exports = startServer;
