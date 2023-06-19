var socket = io();

// Function to create a new list item
function createListItem(text) {
    var li = document.createElement('li');
    li.textContent = text;
    return li;
}

// Function to create a loading animation
function createLoadingItem() {
    var li = document.createElement('li');
    li.id = 'loading';
    li.textContent = '...';
    return li;
}

// When a message is received, remove the loading animation and append the message to the list
socket.on('bot message', function (msg) {
    var loading = document.getElementById('loading');
    if (loading) {
        document.getElementById('messages').removeChild(loading);
    }
    document.getElementById('messages').appendChild(createListItem(`Bot: ${msg}`));
});

// When the form is submitted, send the input value
document.getElementById('message-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from being submitted normally
    var input = document.getElementById('message-input');
    var message = input.value;
    socket.emit('chat message', message);
    // Append the user's message and a loading animation to the list
    document.getElementById('messages').appendChild(createListItem(`You: ${message}`));
    document.getElementById('messages').appendChild(createLoadingItem());
    input.value = ''; // Clear the input
    return false;
});

// Function to create a loading animation
function createLoadingItem() {
    var li = document.createElement('li');
    li.id = 'loading';
    var span1 = document.createElement('span');
    span1.className = 'dot';
    var span2 = document.createElement('span');
    span2.className = 'dot';
    var span3 = document.createElement('span');
    span3.className = 'dot';
    li.appendChild(span1);
    li.appendChild(span2);
    li.appendChild(span3);
    return li;
}