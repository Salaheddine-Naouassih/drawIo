document.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    const container = document.getElementById("container");
    const canvas = document.getElementById("canvas");
    const rect = container.getBoundingClientRect();
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const eraser = document.getElementById("eraser");
    const send = document.getElementById("send");
    let isMouseDown = false;

    function fitCanvas(canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    fitCanvas(canvas);
    //give me black in rgb code 

    let white = "rgb(255, 255, 255)";
    let black = "rgb(0, 0, 0)";
    let color = black;
    eraser.addEventListener("click", function () {
        color != white ? color = white : color = black;
        eraser.style.backgroundColor != "gray" ? eraser.style.backgroundColor = "gray" : eraser.style.backgroundColor = "white";
    });


    const socket = io();


    send.addEventListener("click", function () {
        const message = document.getElementById("message").value;
        socket.emit("message", { message: message, room: roomId });

    }
    );

    socket.on("message", (data) => {
        console.log(data);

        document.getElementById("messages").innerHTML += `<p>${data}</p>`;
    });

    socket.emit("join_room", { room: roomId });

    socket.on("draw", (data) => {
        //ctx.fillStyle = data.color;
        //x = data.coordinates.x;
        //y = data.coordinates.y;
        //console.log({ x, y });
        ////create circle 
        //ctx.beginPath();
        //ctx.arc(x, y, 5, 0, 2 * Math.PI);
        //ctx.fill();
        //ctx.closePath();


        let x = data.coordinates.x;
        let y = data.coordinates.y;
        console.log({ x, y });
        // Get the current image data
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log(imageData);
        // Calculate the index of the pixel
        let index = (x + y * imageData.width) * 4;
        let thickness = 5;
        dataimage = ctx.createImageData(thickness, thickness); // 1x1 pixel
        for (let i = 0; i < dataimage.data.length; i += 4) {
            dataimage.data[i + 0] = 255; // R value
            dataimage.data[i + 1] = 0; // G value
            dataimage.data[i + 2] = 0; // B value
            dataimage.data[i + 3] = 255; // A value
        }
        // Parse the color from data.color (assumed to be in the format "rgb(r, g, b)")
        let [r, g, b] = data.color.match(/\d+/g);


        console.log({ r, g, b });
        // Set the pixel color
        imageData.data[index + 0] = r; // Red
        imageData.data[index + 1] = g; // Green
        imageData.data[index + 2] = b; // Blue
        imageData.data[index + 3] = 255; // Alpha (255 = fully opaqu
        // Put the image data back onto the canvas
        ctx.putImageData(dataimage, x, y);


    });





    canvas.addEventListener('mousedown', function (event) {
        isMouseDown = true;
        // Emit initial coordinates when mouse is pressed
        color = color;
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        socket.emit("coordinates", { color: color, coordinates: { x: x, y: y }, room: roomId, event: "mousedown" });
    })
    canvas.addEventListener('mousemove', function (event) {
        if (isMouseDown) {
            color = color;
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
            socket.emit("coordinates", { color: color, coordinates: { x: x, y: y }, room: roomId, event: "mousemove" });
        }

    })
    canvas.addEventListener('mouseup', function (event) {
        isMouseDown = false;
        socket.emit("coordinates", { event: "mouseup" });
    });

});


