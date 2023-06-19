const socket = io();

// Function to create a new list item
const createListItem = (text) => {
    const li = document.createElement('li');
    li.innerHTML = text.replace(/\n/g, '<br>'); // Replace newline characters with <br> tags
    return li;
};

// Function to create a loading animation
const createLoadingItem = () => {
    const li = document.createElement('li');
    li.id = 'loading';
    const span1 = document.createElement('span');
    span1.className = 'dot';
    const span2 = document.createElement('span');
    span2.className = 'dot';
    const span3 = document.createElement('span');
    span3.className = 'dot';
    li.appendChild(span1);
    li.appendChild(span2);
    li.appendChild(span3);
    return li;
};

// When a message is received, remove the loading animation and append the message to the list
socket.on('bot message', (msg) => {
    const loading = document.getElementById('loading');
    if (loading) {
        document.getElementById('messages').removeChild(loading);
    }
    document.getElementById('messages').appendChild(createListItem(`Bot: ${msg}`));
});

// When the form is submitted, send the input value
document.getElementById('message-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from being submitted normally
    const input = document.getElementById('message-input');
    const message = input.value;
    socket.emit('chat message', message);
    // Append the user's message and a loading animation to the list
    document.getElementById('messages').appendChild(createListItem(`You: ${message}`));
    document.getElementById('messages').appendChild(createLoadingItem());
    input.value = ''; // Clear the input
    return false;
});

// Automatically focus on the input field when the page is loaded
window.addEventListener('load', () => {
    document.getElementById('message-input').focus();
});
