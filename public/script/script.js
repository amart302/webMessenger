document.getElementById('filter_contacts').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterContacts(searchTerm);
});



function filterContacts(searchTerm) {
    const contacts = document.querySelectorAll('.contact_container');

    contacts.forEach(contact => {
        const name = contact.querySelector('#name_user_span').textContent.toLowerCase();
        const lastMessage = contact.querySelector('#last_message').textContent.toLowerCase();

        if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
            contact.style.display = 'flex';
            highlightMatches(contact, searchTerm);
        } else {
            contact.style.display = 'none';
        }
    });
}


function highlightMatches(contact, searchTerm) {
    const nameElement = contact.querySelector('#name_user_span');
    const lastMessageElement = contact.querySelector('#last_message');

    highlightText(nameElement, searchTerm);
    highlightText(lastMessageElement, searchTerm);
}

function highlightText(element, searchTerm) {
    const text = element.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlightedText = text.replace(regex, '<mark style="background: violet;">$1</mark>');
    element.innerHTML = highlightedText;
}