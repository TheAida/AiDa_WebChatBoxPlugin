// Get API key from script tag or use default
let scriptTag = document.currentScript || document.querySelector('script[src*="chatbot.js"]');
let apiKey = scriptTag ? scriptTag.getAttribute('data-aida-api-key') : '47';

// Get DOM elements
const container = document.getElementById('aida-chatbot-container');
const textarea = container.querySelector(".chat-input textarea");
const sendBtn = container.querySelector(".send-btn");
const chatbox = container.querySelector(".chatbox");
const chatbotToggler = container.querySelector(".chatbot-toggler");
const chatbotClose = container.querySelector(".chatbot-close");
const clearChatHistory = container.querySelector(".clear-chat-history");

// Initialize variables
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
let userMessage = "";
let textareaHeight = textarea.scrollHeight;

// Function to create chat message elements
function createChatElement(message, type) {
    let li = document.createElement("li");
    li.classList.add("chat", type);
    
    let content = type === "outgoing" 
        ? `<p>${message}</p>` 
        : `<p>${message}</p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78i iglkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpypmY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMfICEpKQqvn8uancoAAAADdFJOU/AD2OyXvisAAA1SSURBVHja1Zy9jiS3Ecf/tdgSoI3mgKEBOXLig7VPUQbkvA6oEixFigR4n2IewYkE30UTHfb4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" class="svg_bot">`;
    
    li.innerHTML = content;
    return li;
}

// Get cookie value by name
function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
}

// Generate a UUID
function generateUUID() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID(); // Modern browsers
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Set cookie with UUID only if it doesn't exist
function setUUIDCookie(cookieName, days = 365) { // Changed to 365 days for longer persistence
    // First check if cookie already exists
    let existingUUID = getCookie(cookieName);
    
    if (existingUUID) {
        // Cookie already exists, return the existing UUID
        return existingUUID;
    }
    
    // Cookie doesn't exist, create new UUID and set cookie
    const uuid = generateUUID();
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Expiry
    const expires = "expires=" + date.toUTCString();
    document.cookie = cookieName + "=" + uuid + ";" + expires + ";path=/";
    return uuid;
}

const uuidCookie = setUUIDCookie("aida-chatbot-uuid");


// Function to handle bot response
function handleBotResponse(chatElement) {
    let messageElement = chatElement.querySelector("p");
    
    fetch(`https://api.aidasales.ir/api/v1/conversation/chatbox/${apiKey}/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: userMessage,
            thread_id: "47",
            username: uuidCookie
        })
    })
    .then(response => response.json())
    .then(data => {
        let response = data.response;
        messageElement.textContent = response;
        chatHistory.push({sender: "bot", text: response});
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    })
    .catch(() => {
        messageElement.classList.add("error-mes");
        messageElement.textContent = "مشکلی پیش آمده است. لطفا دوباره تلاش کنید.";
    })
    .finally(() => {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    });
}

// Function to handle sending message
function handleSendMessage() {
    userMessage = textarea.value.trim();
    if (!userMessage) return;
    
    let chatElement = createChatElement(userMessage, "outgoing");
    chatbox.appendChild(chatElement);
    chatHistory.push({sender: "user", text: userMessage});
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    
    textarea.value = "";
    textarea.style.height = "55px";
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        let incomingElement = createChatElement("در حال تایپ...", "incoming");
        chatbox.appendChild(incomingElement);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        handleBotResponse(incomingElement);
    }, 600);
}

// Event listeners
textarea.addEventListener("input", () => {
    textarea.style.height = `${textareaHeight}px`;
    textarea.style.height = `${textarea.scrollHeight}px`;
});

textarea.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleSendMessage();
    }
});

sendBtn.addEventListener("click", handleSendMessage);

chatbotToggler.addEventListener("click", () => {
    container.classList.toggle("show-chatbot");
});

chatbotClose.addEventListener("click", () => {
    container.classList.toggle("show-chatbot");
});

clearChatHistory.addEventListener("click", () => {
    chatHistory = [];
    localStorage.removeItem("chatHistory");
    chatbox.innerHTML = `<li class="chat incoming">
        <p class="bot-text">سلام به شما :) <br>چطور میتونم کمکتون کنم؟</p>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78i iglkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpypmY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMfICEpKQqvn8uancoAAAADdFJOU/AD2OyXvisAAA1SSURBVHja1Zy9jiS3Ecf/tdgSoI3mgKEBOXLig7VPUQbkvA6oEixFigR4n2IewYkE30UTHfb4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" class="svg_bot">
    </li>`;
    textarea.style.height = "55px";
});

// Load chat history on page load
chatHistory.forEach(chat => {
    let chatElement = createChatElement(chat.text || "مشکلی به وجود آمده است.", chat.sender === "user" ? "outgoing" : "incoming");
    chatbox.appendChild(chatElement);
});
chatbox.scrollTo(0, chatbox.scrollHeight);