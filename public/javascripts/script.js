// Building a Chatting App 

const socket = io();
let timer;

const nameInput = document.querySelector("#name-input");
const username = document.querySelector(".username")
const nameSubmit = document.querySelector("#name-submit");
const input = document.querySelector("#input-area");
const sendButton = document.querySelector("#send-button");
const messageDiv= document.querySelector("#message-div"); 
const messageBox = document.querySelector("#messages-box");
const nameScreen = document.querySelector("#name-screen")
const nameEmptyError = document.querySelector(".name-empty-error")
const nameSmallError = document.querySelector(".name-small-error")

// submitting name 
nameSubmit.addEventListener("click", () => {
    if (nameInput.value.length > 2) {
        username.innerHTML = nameInput.value + " is chatting"
    } 
    socket.emit("nameset", nameInput.value)
})

socket.on("nameSmallError", () => {
    nameSmallError.style.opacity = 1
    nameEmptyError.style.opacity = 0
})

socket.on("nameEmptyError", () => {
    nameEmptyError.style.opacity = 1
    nameSmallError.style.opacity = 0
})


// recieving namesetdone event from backend after name is set
socket.on("namesetdone", () => {
    nameScreen.style.display = "none"
})

socket.on("numberofliveusers", (liveUsers)=> {
    if(liveUsers === 1) {
        document.querySelector(".live-users").innerHTML = liveUsers + " person is live"
    } 
    else {
        document.querySelector(".live-users").innerHTML = liveUsers + " people are live"
    }
})

// writing a global function to send message 
function sendMessage() {
    const inputValue = input.value.trim();
    if (inputValue) {
        socket.emit("message", inputValue);
        input.value = "";
    }
}

// sending the message through send button 
sendButton.addEventListener("click", function () {
    sendMessage()
});

// displaying the message in message window through sending a socket event

let container = ``;
socket.on("message", function (message) {
    let myMessage = message.id === socket.id;
    const container = `
        <div class="flex ${myMessage ? 'justify-end' : 'justify-start'}">
            <div class="${myMessage ? 'bg-blue-600' : 'bg-zinc-800'} text-white p-3 ${myMessage ? 'rounded-l-lg rounded-br-lg' : 'rounded-r-lg rounded-tl-lg'}">
                <p class="text-lg">
                    <span class="font-bold">${message.name}</span>: <span class="font-light">${message.message}</span>
                </p>
            </div>
        </div>
    `;

    // Append the constructed message to the messages container
    messageDiv.innerHTML += container;

    // Update the scroll position of the messages container to ensure the latest message is visible
    messages.scrollTop = messages.scrollHeight;
});


// js to send message through enter key and give space if shift is pressed with enter 
input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        if (event.shiftKey) {
            const cursorPos = this.selectionStart;
            this.value = this.value.slice(0, cursorPos) + "\n" + this.value.slice(cursorPos);
            // Move the cursor position just after the inserted newline
            this.selectionStart = this.selectionEnd = cursorPos + 1;
        } else {
            event.preventDefault();
            socket.emit("message", input.value);
            input.value = "";
        }
    }
});


// typing functionality 
document.querySelector(".main-screen").addEventListener("input", () => {
    socket.emit("typing")
})

socket.on("typing", (name) => {
    document.querySelector(".typing").textContent = `${name.name} is typing`
    clearInterval(timer)
    timer = setTimeout(() => {
        document.querySelector(".typing").textContent = ""
    }, 1200)
})