const user = JSON.parse(sessionStorage.getItem('user'));
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        const messagesDiv = document.querySelector('.container_messages_place');

        if (Array.isArray(data)) {
            data.forEach((message) => {
                const messageEl = document.createElement('div');
                messageEl.textContent = `${message.username}: ${message.content}`;
                messagesDiv.appendChild(messageEl);
            });
        } else {
            const messageEl = document.createElement('div');
            messageEl.textContent = `${data.username}: ${data.content}`;
            messagesDiv.appendChild(messageEl);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

document.getElementById('submit').addEventListener('click', () => {
    const messageInput = document.getElementById('message_user_input');
    const message = messageInput.value;
    const username = user.username;
    const id = user.id;
    ws.send(JSON.stringify({ id, username, message }));
    messageInput.value = '';
});

document.addEventListener('keydown', (e) => {
    switch(e.key){
        case 'Enter':
            const messageInput = document.getElementById('message_user_input');
            const message = messageInput.value;
            const username = user.username;
            const id = user.id;
            ws.send(JSON.stringify({ id, username, message }));
            messageInput.value = '';
            break;
    }
});