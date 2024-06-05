
/** @returns {void} */
async function main() {


    const socket = io("http://localhost:3000");

    const createRoom = document.getElementById("createRoom");

    socket.on('connect_error', (error) => {
        console.log(error);
    });


    createRoom.addEventListener("click", (event) => {
        event.preventDefault();
        axios.post("http://localhost:3000/room")
            .then((response) => {
                console.log(response);
                window.location.href = response.data.url;

            })
            .catch((error) => {
                console.log(error);
            })
    })


}



main();
