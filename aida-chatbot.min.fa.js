!function(){let scriptTag = document.currentScript || document.querySelector('script[src*="aida-chatbot.min.js"]');
    let apiKey = scriptTag ? scriptTag.getAttribute('data-aida-api-key') : '47';
    let positionChatbox = scriptTag ? scriptTag.getAttribute('data-position-chatbox') : 'right';
    let initialState = scriptTag ? scriptTag.getAttribute('data-initial-state') : 'closed';
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
    
    // Clear old chat history that might contain HTML instead of raw markdown
    // localStorage.removeItem("chatHistory"); // Commented out to preserve chat history
    
    // Custom markdown parser function
    function parseMarkdown(text) {
        if (!text) return text;
        
        // Convert **text** to <b>text</b>
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        
        // Convert [content link](address link) to <a href="address link" target="_blank">content link</a>
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        return text;
    }
    
    let t=document.createElement("div");t.id="aida-chatbot-container",t.dir="rtl";
    // Apply initial state class if open
    if(initialState === 'open') {
        t.classList.add('show-chatbot');
    }
    t.innerHTML=`
    <style>
    /*
        Dana fonts are considered a proprietary software. To gain information about the laws regarding
        the use of these fonts, please visit www.fontiran.com
        ---------------------------------------------------------------------
        This set of fonts are used in this project under the license: (17KXIWC4)
        ---------------------------------------------------------------------
    */
      #aida-chatbot-container, 
      #aida-chatbot-container *,
      #aida-chatbot-container *::before,
      #aida-chatbot-container *::after {
          box-sizing: border-box;
          direction: rtl;
      }

      #aida-chatbot-container {
          background-color: transparent;
      }

      /*todo chatbot */
      .chatbot-toggler_AIDACHATBOX {
          position: fixed;
          ${positionChatbox === 'left' ? 'left: 40px;' : 'right: 40px;'}
          bottom: 35px;
          height: 50px;
          width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #00AF9E;
          border-radius: 50%;
          border: none;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 9999;
      }
      .show-chatbot .chatbot-toggler_AIDACHATBOX {
          transform: rotate(90deg);
      }
      .chatbot-toggler_AIDACHATBOX .img1_AIDACHATBOX , .img2_AIDACHATBOX{
          position: absolute;
      }
      .show-chatbot .chatbot-toggler_AIDACHATBOX .img1_AIDACHATBOX,
      .chatbot-toggler_AIDACHATBOX .img2_AIDACHATBOX {
          opacity: 0;
      }
      .show-chatbot .chatbot-toggler_AIDACHATBOX .img2_AIDACHATBOX {
          opacity: 1;
      }
      .chatbot_AIDACHATBOX {
          transform: scale(0.5);
          opacity: 0;
          pointer-events: none;
          position: fixed;
          ${positionChatbox === 'left' ? 'left: 40px;' : 'right: 40px;'}
          bottom: 100px;
          width: 420px;
          overflow: hidden;
          background-color: #fff;
          border-radius: 15px;
          transform-origin: bottom ${positionChatbox === 'left' ? 'left' : 'right'};
          box-shadow: 0 0 128px 0 rgba(0, 0, 0, 0.1), 0 32px 64px -48px rgba(0, 0, 0, 0.5);
          transition: all 0.1s ease;
          z-index: 9999;
      }
      .show-chatbot .chatbot_AIDACHATBOX {
          transform: scale(1);
          opacity: 1;
          pointer-events: auto;

      }
      .svg_bot_AIDACHATBOX {
          width: 32px;
          align-self: flex-end;
          background: white;
          text-align: center;
          line-height: 32px;
          border-radius: 4px;
          margin: 0 10px 7px 0;
      }
      .chatbot_AIDACHATBOX header {
          background-color: #00AF9E;
          padding: 16px 0;
          text-align: center;
          position: relative;
      }

      .chatbot_AIDACHATBOX header h2 {
          margin: 0;
          color: #fff;
          font-size: 1.4rem;
      }
      .chatbot-close_AIDACHATBOX {
          position: absolute;
          right: 20px;
          top: 50%;
          background-color: #00AF9E;
          border: none;
          outline: none;
          cursor: pointer;
          display: none;
          transform: translateY(-50%);
      }
      .clear-chat-history_AIDACHATBOX {
          position: absolute;
          left: 20px;
          top: 30%;
          background-color: #00AF9E;
          border: none;
          outline: none;
          cursor: pointer;
      }
      .chatbot_AIDACHATBOX .chatbox_AIDACHATBOX {
          max-height: 60vh;
          height: 510px;
          overflow-y: auto;
          padding: 30px 20px 100px;
      }
      .chatbox_AIDACHATBOX .chat_AIDACHATBOX {
          display: flex;
      }
      .chatbox_AIDACHATBOX .outgoing {
          margin: 20px 0;
          justify-content: flex-start;
      }
      .chatbox_AIDACHATBOX .incoming_AIDACHATBOX {
          justify-content: flex-end;
      }
      .chatbox_AIDACHATBOX .chat_AIDACHATBOX p {
          color: #fff;
          max-width: 75%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          font-size: 0.95rem;
          padding: 12px 16px;
          border-radius: 10px 10px 0 10px;
          background-color: #00AF9E;
          margin: 0;
      }
      .chatbot_AIDACHATBOX .chat_AIDACHATBOX p.error-mes {
          color: rgb(185, 6, 6);
          background-color: rgba(238, 151, 151, 0.635);
      }
      .chatbox_AIDACHATBOX .incoming_AIDACHATBOX p {
          color: #000;
          background-color: #f2f2f2;
          border-radius: 10px 10px 10px 0;
      }
      .chatbox_AIDACHATBOX .incoming_AIDACHATBOX p p {
        padding:0;
      }
      .chatbot_AIDACHATBOX .chat-input_AIDACHATBOX {
          position: absolute;
          bottom: 0vh;
          width: 100%;
          display: flex;
          gap: 5px;
          background-color: #fff;
          padding: 8px 20px;
          border-top: 1px solid #ccc;
      }
      .chat-input_AIDACHATBOX textarea {
          height: 55px;
          width: 100%;
          max-height: 180px;
          border: none;
          outline: none;
          font-size: 0.95rem;
          resize: none;
          padding: 16px 15px 16px 0;
      }
      .chat-input_AIDACHATBOX button {
          background-color: white;
          align-self: flex-end;
          height: 55px;
          line-height: 55px;
          font-size: 1.35rem;
          cursor: pointer;
          border: none;
          outline: none;
          visibility: hidden;
      }
      .chat-input_AIDACHATBOX textarea:valid ~ button {
          visibility: visible;
      }



      @media only screen and (max-width: 480px) {
          /*todo chatbot */
          .chatbot_AIDACHATBOX {
              right: 0px;
              left: 0px;
              bottom: 0px;
              width: 100%;
              height: 100%;
              border-radius: 0;
          }
          .chatbot_AIDACHATBOX .chatbox_AIDACHATBOX {
              height: 90%;
              max-height: 80vh;
          }
          .chatbot_AIDACHATBOX header button {
              display: block;
          }
          body:has(.show-chatbot) {
            overflow: hidden;
            position: fixed;
            width: 100%;
        }
      }
      @media only screen and (max-height: 480px) {
          .chatbot-toggler_AIDACHATBOX {
              bottom: 5px;
          }
          .chatbot_AIDACHATBOX {
              right: 40px;
              bottom: 60px;
          }
      }
    </style>
    <button class="chatbot-toggler_AIDACHATBOX">
      <svg xmlns="http://www.w3.org/2000/svg" width="40px" class="img1_AIDACHATBOX" viewBox="0 0 24 24" fill="none" stroke="#ffffff" transform="matrix(-1, 0, 0, 1, 0, 0)">
        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
        <g id="SVGRepo_iconCarrier"> <path d="M4.82698 7.13803L5.27248 7.36502L4.82698 7.13803ZM5.2682 18.7318L5.62175 19.0854H5.62175L5.2682 18.7318ZM17.862 16.173L17.635 15.7275L17.862 16.173ZM19.173 14.862L18.7275 14.635L19.173 14.862ZM19.173 7.13803L18.7275 7.36502V7.36502L19.173 7.13803ZM17.862 5.82698L18.089 5.38148V5.38148L17.862 5.82698ZM6.13803 5.82698L6.36502 6.27248L6.13803 5.82698ZM7.20711 16.7929L7.56066 17.1464L7.20711 16.7929ZM5 10.3C5 9.45167 5.00039 8.84549 5.03921 8.37032C5.07756 7.90099 5.15089 7.60366 5.27248 7.36502L4.38148 6.91103C4.17609 7.31413 4.08593 7.75771 4.04253 8.28889C3.99961 8.81423 4 9.46817 4 10.3H5ZM5 11.5V10.3H4V11.5H5ZM4 11.5V16.5H5V11.5H4ZM4 16.5V18.4136H5V16.5H4ZM4 18.4136C4 19.26 5.02329 19.6838 5.62175 19.0854L4.91465 18.3782C4.91754 18.3753 4.92812 18.368 4.94323 18.3654C4.9556 18.3632 4.96421 18.3654 4.96913 18.3674C4.97406 18.3695 4.98164 18.374 4.98888 18.3843C4.99771 18.3968 5 18.4095 5 18.4136H4ZM5.62175 19.0854L7.56066 17.1464L6.85355 16.4393L4.91465 18.3782L5.62175 19.0854ZM14.7 16H7.91421V17H14.7V16ZM17.635 15.7275C17.3963 15.8491 17.099 15.9224 16.6297 15.9608C16.1545 15.9996 15.5483 16 14.7 16V17C15.5318 17 16.1858 17.0004 16.7111 16.9575C17.2423 16.9141 17.6859 16.8239 18.089 16.6185L17.635 15.7275ZM18.7275 14.635C18.4878 15.1054 18.1054 15.4878 17.635 15.7275L18.089 16.6185C18.7475 16.283 19.283 15.7475 19.6185 15.089L18.7275 14.635ZM19 11.7C19 12.5483 18.9996 13.1545 18.9608 13.6297C18.9224
         14.099 18.8491 14.3963 18.7275 14.635L19.6185 15.089C19.8239 14.6859 19.9141 14.2423 19.9575 13.7111C20.0004 13.1858 20 12.5318 20 11.7H19ZM19 10.3V11.7H20V10.3H19ZM18.7275 7.36502C18.8491 7.60366 18.9224 7.90099 18.9608 8.37032C18.9996 8.84549 19 9.45167 19 10.3H20C20 9.46817 20.0004 8.81423 19.9575 8.28889C19.9141 7.75771 19.8239 7.31413 19.6185 6.91103L18.7275 7.36502ZM17.635 6.27248C18.1054 6.51217 18.4878 6.89462 18.7275 7.36502L19.6185 6.91103C19.283 6.25247 18.7475 5.71703 18.089 5.38148L17.635 6.27248ZM14.7 6C15.5483 6 16.1545 6.00039 16.6297 6.03921C17.099 6.07756 17.3963 6.15089 17.635 6.27248L18.089 5.38148C17.6859 5.17609 17.2423 5.08593 16.7111 5.04253C16.1858 4.99961 15.5318 5 14.7 5V6ZM9.3 6H14.7V5H9.3V6ZM6.36502 6.27248C6.60366 6.15089 6.90099 6.07756 7.37032 6.03921C7.84549 6.00039 8.45167 6 9.3 6V5C8.46817 5 7.81423 4.99961 7.28889 5.04253C6.75771 5.08593 6.31413 5.17609 5.91103 5.38148L6.36502 6.27248ZM5.27248 7.36502C5.51217 6.89462 5.89462 6.51217 6.36502 6.27248L5.91103 5.38148C5.25247 5.71703 4.71703 6.25247 4.38148 6.91103L5.27248 7.36502ZM7.56066 17.1464C7.65443 17.0527 7.78161 17 7.91421 17V16C7.51639 16 7.13486 16.158 6.85355 16.4393L7.56066 17.1464Z" fill="#ffffff"/> <path d="M8.5 9.5L15.5 9.5" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"/> <path d="M8.5 12.5L13.5 12.5" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"/> </g>
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" class="img2_AIDACHATBOX" viewBox="0 0 24 24" version="1.1" fill="#ffffff" stroke="#ffffff">
        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
        <g id="SVGRepo_iconCarrier"> <title>Close</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Close"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <line x1="16.9999" y1="7" x2="7.00001" y2="16.9999" id="Path" stroke="#ffffff" stroke-width="2" stroke-linecap="round"> </line> <line x1="7.00006" y1="7" x2="17" y2="16.9999" id="Path" stroke="#ffffff" stroke-width="2" stroke-linecap="round"> </line> </g> </g> </g>
      </svg>
    </button>
    <section class="chatbot_AIDACHATBOX" lang="fa">
      <header>
        <h2>آیدا</h2>
        <button class="chatbot-close_AIDACHATBOX">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30px" class="img3_AIDACHATBOX" class="img2_AIDACHATBOX" viewBox="0 0 24 24" version="1.1" fill="#ffffff" stroke="#ffffff">
            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="SVGRepo_iconCarrier"> <title>Close</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Close"> <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"> </rect> <line x1="16.9999" y1="7" x2="7.00001" y2="16.9999" id="Path" stroke="#ffffff" stroke-width="2" stroke-linecap="round"> </line> <line x1="7.00006" y1="7" x2="17" y2="16.9999" id="Path" stroke="#ffffff" stroke-width="2" stroke-linecap="round"> </line> </g> </g> </g>
          </svg>
        </button>
        <button class="clear-chat-history_AIDACHATBOX">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" width="20px" class="img4_AIDACHATBOX" version="1.1" id="Capa_1" viewBox="0 0 612.002 612.002" xml:space="preserve">
            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="SVGRepo_iconCarrier"> <g> <path d="M594.464,534.414H344.219L606.866,271.77c6.848-6.851,6.848-17.953,0-24.8L407.547,47.65 c-3.291-3.288-7.749-5.135-12.401-5.135c-4.65,0-9.11,1.847-12.398,5.135L5.138,425.262c-6.851,6.848-6.851,17.95,0,24.8 l114.29,114.287c3.288,3.291,7.749,5.138,12.398,5.138h462.638c9.684,0,17.536-7.852,17.536-17.536 C612,542.265,604.148,534.414,594.464,534.414z M395.145,84.851L569.664,259.37L363.27,465.763L188.753,291.245L395.145,84.851z M294.618,534.414H139.09L42.336,437.66l121.617-121.617l174.519,174.519L294.618,534.414z"/> </g> </g>
          </svg>
        </button>
      </header>
      <ul class="chatbox_AIDACHATBOX">
        <li class="chat_AIDACHATBOX incoming_AIDACHATBOX">
          <p class="bot-text_AIDACHATBOX">سلام به شما :) <br>چطور میتونم کمکتون کنم؟</p>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMf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" class="svg_bot_AIDACHATBOX">
        </li>
      </ul>
      <div class="chat-input_AIDACHATBOX">
        <textarea placeholder="پیام مورد نظر خود را وارد کنید..." required></textarea>
        <button class="send-btn_AIDACHATBOX">
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" class="img5_AIDACHATBOX" viewBox="0 0 24 24" fill="none" transform="matrix(-1, 0, 0, 1, 0, 0)">
            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="SVGRepo_iconCarrier"> <path d="M9.51002 4.23001L18.07 8.51001C21.91 10.43 21.91 13.57 18.07 15.49L9.51002 19.77C3.75002 22.65 1.40002 20.29 4.28002 14.54L5.15002 12.81C5.37002 12.37 5.37002 11.64 5.15002 11.2L4.28002 9.46001C1.40002 3.71001 3.76002 1.35001 9.51002 4.23001Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M5.44 12H10.84" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
          </svg>
        </button>
      </div>
    </section>
  `,document.body.appendChild(t);let e=t.querySelector(".chat-input_AIDACHATBOX textarea"),o=t.querySelector(".send-btn_AIDACHATBOX"),a=t.querySelector(".chatbox_AIDACHATBOX"),i=t.querySelector(".chatbot-toggler_AIDACHATBOX"),r=t.querySelector(".chatbot-close_AIDACHATBOX"),s=t.querySelector(".clear-chat-history_AIDACHATBOX"),n=JSON.parse(localStorage.getItem("chatHistory"))||[],c="",l=e.scrollHeight,h=(t,e)=>{let o=document.createElement("li");o.classList.add("chat_AIDACHATBOX",e);let a="outgoing"===e?`<p>${t}</p>`:`<p>${"incoming_AIDACHATBOX"===e?parseMarkdown(t):t}</p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMfICEpKQqvn8uancoAAAADdFJOU/AD2OyXvisAAA1SSURBVHja1Zy9jiS3Ecf/tdgSoI3mgKEBOXLig7VPUQbkvA6oEixFigR4n2IewYkE30UTHfb4lA740c1usrtnVoKtSW53tvvXxWKxvsg++M7HHt+FjT8rdu4XAKD7AQIAQLgXoOn+DRF2AMAjABLcCVCQAY/w8Ri2AYArHglB+C6AIrieH0nYcBdA4C5nJiW/DwC4izEMLuEOgIHcYSSOoHwHQMHuZCRBgtEdADmxGxlpUB4qYQsACW7kpGw0VMIGwEiCGzsZG/nIEjYAynBXdjJ2uN4OEIa7Bicjh4+0uAUIVAESRlrcAMDI052/AUDDaBrGACNjd3FHUqHeDOAMkAzgGwHKVQJxuwugRQJxI7ebAUHZHb8RwGlkSWOAzADhLoC3AP+jA/DHlMDeKkFdTP8XErwR4HcC6G2AkAG4G+A0dyg3AzQ4sldODuVtAL
          4LICkyOdz4DpfGLqEA9D6AZgDdFRdSKCiAcBcgMSgF1ztiY44GZOTitwOc3JHT/Xfwu8I7Zp/bAc3t45JhBJhu/45OW4QBIN1PKUfToKwjQh+gAHAiN3IYSxB2AcBHAQaA3eCODAgO127t1QUAcHdHcAliLA43uAtwDFAuFHYJcmIYuZK7S2cQHYCVBym5sp6YtKTKHRE6AClDNbiR4kzCuWyztQhrwOwisENxYoRy2bqAXANm1wgcZ5we4UIr+hAwu8TA8giArE7gSgTd/EJwIgA83WZLW1gBmsrEAAgwF1xoG7B4Qq7+Z18ub1j9TiujTJ9/1G/CJmBRW7U+pTeGJaDhL31KNqYtgKGjALx7Nye0Y1gAZipIj3+nOOU5KC6lHeUCMP3RkDyIgMskWHIprZ4XgCqeZQdkAOuMsFJCC5j+VhyYAuRSCAr2RYhZAGi6P12FR2D2q2CphBZQAujskWcI1wGl1dikGi1A6lizlCCFUlJJKGbUKKEFoAygShIE6fpsiYbQWkIDyGgtIURBLsgeIlsBuFVCC6DGqToQHFKcyGQFOgKkP1SnCrAbSbCiQIQ0hrkWWwcUSvOnhgclCcWbp6EJN7lCA8BcgDSVysJVKYKQxiBhA5Av1jRkBFCdFgOSpgcAo9yAm+435JuKYbM7moxtDlCuAmieNKW0ksrvgLs0ae8cIFycqpVsQljSwyV9o2kORoBQPF7NRhCKM5T0L8i9SdnmAJS4VBMBhQGPyOYBSiI0WecMYGWdtGuptmSTHsA5De8DpMkjDEEAKoFJAXZFyhs6AE1TNK0ll5RrVttSwB3BMMv9ZwAJaQR1LRlYASDMrJtc2s5aC1Aqfi9PuiTfXAcFhNRg7QGQFwrqADiHpkmtBkoNVnQA5I4w5SAGuEJSQNLipARBWNllDTDKyaBPUQQMIUjyy9mlkdK8QzoBlF1pEgAgN5wJJOnH7JgV59ze6wCEy+8GwF0gTKSUEt8UGw0sYdYhnQDJQOvCT+rAmWBQACkD50SV0AO4Y1qMCMmOlOHJHku8MpxIgq0B8JIS5/sNpKQsLlRWs6SBkU6d7gmQqgOeopAgCEuQkDN1zstEAWVfAYxc2RDq/QoyhFQrsJdqIYXa82RJE4BdgtIshsE1t1Oliu8KdsGZ1gBllyBcnpTtyMiVc8iTPAhXMFVTnADB4QhWxg9yQ9DkQEt0TJHJQJMpVoAEJ0N6TFrELlQ8cLLvHJnIQegA3EjJitXmZYXgjpoAp8gEF0i15QqAGwsLgpesVFKpNXPWybEgaA9ArowzuPhvd5RSK9R4JQjuwopp06UAjFzPUEwrXxFSJpEC1pQiKVkfICcC+dz3pFzGaKpUJEVXoC6GCmAXeUTQWXpUUh5MxZKl6ArwEqDskBPNHBLVzF7CTARylyAdQHBAeOaQQq2/lKdSxhBcWcBGLUCCA1N9qJjlgzZPPMBupD2AAVSemRK1Wpvk1RlyQWBQkC8BbgCXkgvJL3BTBICKOLABICjN07FF8MgigF3OawBcgfyonGnOWh711jSGHoBcUbZWi/cKi2pTsqdx5T6AiuOgeb45SZ+VAjdCdUklkJArWKkkAa0ARfokggSjqTE1ASTt7Vp1qevKKE2SskNWAHZBQKhJ6aJjk6UXSlocABz1yat2i0zGZOSCLsBoGgB6G7h5atEBKLuQllzGOi2nIkLa/+kDhMtzOv2iUnRy9mlL
          QHCwBEGT6C5E4KxGZesDcquj2/GaxRU3GgE0RT+MuqeUTQreBZwpB3cebsWnuJIAtAY8JkOijSZpGoME6UlwSun81l56rjqVBcVWGwB3LWAxCIUrS068KkCCQxC6HcOFHg3BSCAoRVBBQ9A6gf4gggs7BHi6VqW6A3hIrYqwDTDAlRwK+iG+JqV5Pa7Ctj2AXDkaXE6glxgvSSXuwMMrgCB7B3NyEREE4BhjTCWQK55+iZe2abclgpICX316ifFCrnAXxBivwBEB3AEjA76KMcZXuMINz/FzfAUdEcBdwTgDzzHG+AVB4YoEw7wcXcB0ZuECCcA3McYYL0Hh8pQB1HThVm09mtGzBPHKCs8/z25Z7QbIrJ/oDpDgfYwxxldWOGIGNJGsbVfRPFQqIPmmV1LYQwG0w24A6z5puimSwp5ekj6wZ8fN9kMGQKFPsQBwEGDAwwzwPgP4OEEq4KLQ5wKwwwSdAyQDrpyrRV3tDK2/GQBc05pcdJK9883TDBAnwOxZWwAFRoBFL7oFPADV/XQArzRqhhfA0wUoIj4PAbN+/PLzfKk9ctkCyAgQL1WuOwHTRHYBDzuAh9eHSy3R4hoQN2Y9A55WgC8XhXw+CHi6Pg0keHkj4GOR4JdtwPPleVoLX6blLL+Wn8NhQPFiSYI/5yFcwnLttYCI1wnweSbBx6LQv44WbwcQY4zxc4ykkD9lmPAIoBnwl/UQSCHZpX2+7AD+Nm3bWlqMLzGSQr9ZSGAbHqk84+uZBBVw/Xq5HHkFKHr+Kk6BRb/NSrzScoMrjL7QHEsS4H2RoJdgaX+7u9zzylNg6QP64aqu5ldWVIW8UjcG9bIO+XN1pAqrAPSOQcgbAf0DqvihAILC6MvCIfgwzFfAj3PAw8smoJuplVsuQeHVrg/nB9MtF1c4fr4VMK2l1DKsuMMA+jQHyM8vtwKm1eyKyayufDRHeppsT+Hyzad7Af9JGxbvb5WgphfXBJjW5vievzeA8sif2BVuW6tpuRmb7Oh5mjeF28OPu4B2wx3ftgD6fs+W22rOigSfkUvhn/cAWADeTzco3PH9ji0v6g/Fp2nMCncJL5sAA5oTXVIW4/XrBKhO+sKDAXCzW16KhXjhDOBNgADtfj3wr49VYoW7UQH0/XJtE9ZE+YdP1QemyvVlCEjnmNqzJUQfP9bLE6CUDOg9nxZnS5Tpl4+58C2dpaeUL1zRjwuyOCKAX39+ifGnqQGheQzX9TzS+gSPBODXGK9le3eyzS/XdRiiVWuxHpeb91AE8VOM8XLqARZtDUMO99Q0bB9ijBecV9OAdWuRXE9TBlZ7KIMDeMgt1mZ7W4Pjsd2k0ZyRoGcHi2/ao4rTYSuAOocQZRXfEabdyvkWyQcK7utzlLJqDMH7gEFG8yF0vCM2TgPRbkzgTYDvhngJ7aldXet4JzXYASjvVf6bR2lGeWH7d+PNY2U7KuAdgO+kKeloyRZAeE8F7fsk67N5tKeCrRNRu0oQ9taSe8cLw44K9gBCOypwbAM23/Ki4ie3Lt8YQ9p92APIRm88+MKOeoCNc+C0Xi69q8ftffalHQ2O2o4SlbBe8T3AqD1ctiz3B9zvycmRE5K18ztO9ZQOqLxXLSLtYCyXax/Q2acQUArIO8dMp4AUlpnKP+tB7CNWgzYmAgg/IV5p96ht28sOTab1FF9pNcW6kR+nc+8fTrmVgEUDfnfxLs/IJgDfsP
          q9aQfZQ4yvuMl9OPw7AITaeHld28cOIO+KVwD7/xhwvQ1Q/ELekX+K8d/hFkDd+Ms7uQ/d6nr7FYxmYeBGQJ2/ejTx+fXg6wd1Z7AqMe1UdjdDhwBgPgt524CPA7QFaNoN9eMAkIRSsks5VuLHAYagwT/kbNVdT+OqdmRDbbEabnuTxrB4hwsbyhp9a4tTvLjlhah8zrcJy3LDuzwpD5jdMR3CPQbIecBs/zAMo34/uHIbY3Npd/htIpvOTM/DquEoQGkeXN5Nx/CPvo4ky4Y0bWTB3RwpeEsIG1lw922i2S8nrI4l7QLG+boc8wcb/9/DMY/UtTgbKaH3PtOo3uxWlZ1sncbSyxG3LjxOEvVIaOvXruhk+qOSx8cAP5Db9+t3677Hc0PZVwKtHADwFkD332vr67B0QtYDXNfOWzq8GzB7HWAPMJyE0QiPdTD0rYAp+9e9VHc0CXWjcBcwqj9ooKNjfSTFcBqWABrm7XwIMGqFTWNYKmkJGP6vJ/UU8TZAN4/V9a5YAsJG2ngEMOrFTZ1d2wEMM28eqPkgYMpWdgDYD2rbpS/th9VNwLClOlOubAJ4u/zqTNRBAB0EjAzRwtDWFoCRHY0fcgzgvyXAtgDyZoAfANAbAf67AvBWAB0B4P
          cE4NBnDLC3At4swT0f/S9sw79OxPul9AAAAABJRU5ErkJggg==" class="svg_bot_AIDACHATBOX">`;return o.innerHTML=a,o},p=(chatEl,retry=0)=>{const MAX_RETRIES=2;let e=chatEl.querySelector("p");fetch(`https://api.aidasales.ir/api/v1/conversation/chatbox/${apiKey}/message`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:c,thread_id:uuidCookie,username:uuidCookie})}).then(res=>res.json()).then(data=>{let o=data.response;if(!o||o===null||o.trim()===""){if(retry<MAX_RETRIES){setTimeout(()=>{p(chatEl,retry+1)},1000)}else{e.classList.add("error-mes"),e.textContent="پاسخی دریافت نشد. لطفا دوباره تلاش کنید."}}else{let parsedHtml=parseMarkdown(o);e.innerHTML=parsedHtml,n.push({sender:"bot",text:o}),localStorage.setItem("chatHistory",JSON.stringify(n))}}).catch(()=>{if(retry<MAX_RETRIES){setTimeout(()=>{p(chatEl,retry+1)},1000)}else{e.classList.add("error-mes"),e.textContent="مشکلی به وجود آمده است. بعداً امتحان کنید."}}).finally(()=>a.scrollTo(0,a.scrollHeight))},d=()=>{if(!(c=e.value.trim()))return;let t=h(c,"outgoing");a.appendChild(t),n.push({sender:"user",text:c}),localStorage.setItem("chatHistory",JSON.stringify(n)),e.value="",e.style.height="55px",a.scrollTo(0,a.scrollHeight),setTimeout(()=>{let t=h("درحال تایپ...","incoming_AIDACHATBOX");a.appendChild(t),a.scrollTo(0,a.scrollHeight),p(t)},600)};e.addEventListener("input",()=>{e.style.height=`${l}px`,e.style.height=`${e.scrollHeight}px`}),e.addEventListener("keyup",t=>{"Enter"===t.key&&!t.shiftKey&&window.innerWidth>800&&(t.preventDefault(),d())}),o.addEventListener("click",d),i.addEventListener("click",()=>t.classList.toggle("show-chatbot")),r.addEventListener("click",()=>t.classList.toggle("show-chatbot")),s.addEventListener("click",()=>{n=[],localStorage.removeItem("chatHistory"),a.innerHTML=`<li class="chat_AIDACHATBOX incoming_AIDACHATBOX"><p class="bot-text_AIDACHATBOX">سلام به شما :) <br>چطور میتونم کمکتون کنم؟</p>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMf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" class="svg_bot_AIDACHATBOX"></li>`,e.style.height="55px"}),n.forEach(t=>{let e=h(t.text||"مشکلی به وجود آمد.","user"===t.sender?"outgoing":"incoming_AIDACHATBOX");a.appendChild(e)}),a.scrollTo(0,a.scrollHeight)}();