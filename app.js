const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIo(server);

const userids = []
const usernames = []

io.on("connection", (socket) => {
    socket.on("message", function (message) {
        let index = userids.indexOf(socket.id);
        let name = usernames[index];
        io.emit("message", { message, name, id:socket.id });
    });
    
    socket.on("nameset", (username) => {
        if (username.length === 0) {
            socket.emit("nameEmptyError")
        }
        else if (username.length < 3) {
            socket.emit("nameSmallError")
        } 
        else {
            userids.push(socket.id)
            usernames.push(username);

            socket.emit("namesetdone")

            io.emit("numberofliveusers", usernames.length)
        }
        

    })

    socket.on("typing", () => {
        let index = userids.indexOf(socket.id)
        let name = usernames[index]

        socket.broadcast.emit("typing", {name})
    })

    socket.on("disconnect", () => {
        let index = userids.indexOf(socket.id)

        if(index !== -1) {
            usernames.splice(index, 1)
            userids.splice(index, 1)
        }

        io.emit("numberofliveusers", usernames.length)
    })
});


app.get('/', (req, res) => {
    res.render('index');
});

server.listen(3000);