const user = JSON.parse(sessionStorage.getItem('user'));
const ws = new WebSocket('ws://localhost:8080');
if(!user){
    window.location.href = '/register';
}
document.title = user.username;


ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        const messagesDiv = document.querySelector('.chat-container-msgs');

        if (Array.isArray(data)) {            
            data.forEach((message) => {
                const messageEl = document.createElement('div');
                if(message.user_id === user.id){                    
                    messageEl.innerHTML = `<div class="chat-container-msg"><div class="chat-container-msg-txt">${message.content}</div></div>`;
                    messagesDiv.appendChild(messageEl);
                } else{
                    messageEl.innerHTML = `<div class="chat-container-msg2"><div class="chat-container-msg-name">${message.username}</div><div class="chat-container-msg-txt">${message.content}</div></div>`;
                    messagesDiv.appendChild(messageEl);
                }
            });
            document.querySelector('.chat-container-msgs').scrollTop = document.querySelector('.chat-container-msgs').scrollHeight;
        } else {
            const messageEl = document.createElement('div');
            if(data.user_id === user.id){
                messageEl.innerHTML = `<div class="chat-container-msg"><div class="chat-container-msg-txt">${data.content}</div></div>`;
                messagesDiv.appendChild(messageEl);
            } else{
                messageEl.innerHTML = `<div class="chat-container-msg2"><div class="chat-container-msg-name">${data.username}</div><div class="chat-container-msg-txt">${data.content}</div></div>`;
                messagesDiv.appendChild(messageEl);
            }
            document.querySelector('.chat-container-msgs').scrollTop = document.querySelector('.chat-container-msgs').scrollHeight;
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
    if(message.length != 0){
        const username = user.username;
        const id = user.id;
        ws.send(JSON.stringify({ id, username, message }));
        messageInput.value = '';
        document.querySelector('.chat-container-msgs').scrollTop = document.querySelector('.chat-container-msgs').scrollHeight;
    }
});

document.addEventListener('keydown', (e) => {
    switch(e.key){
        case 'Enter':
            const messageInput = document.getElementById('message_user_input');
            const message = messageInput.value;
            if(message.length != 0){
                const username = user.username;
                const id = user.id;
                ws.send(JSON.stringify({ id, username, message }));
                messageInput.value = '';
                document.querySelector('.chat-container-msgs').scrollTop = document.querySelector('.chat-container-msgs').scrollHeight;
            }
            break;
    }
});