!function(){let scriptTag = document.currentScript || document.querySelector('script[src*="aida-chatbot.min.js"]') || document.querySelector('script[src*="aida-chatbot.min.fa.js"]');
    let apiKey = scriptTag ? scriptTag.getAttribute('data-aida-api-key') : '47';
    let positionChatbox = scriptTag ? scriptTag.getAttribute('data-position-chatbox') : 'right';
    let initialState = scriptTag ? scriptTag.getAttribute('data-initial-state') : 'closed';
    let rawQuestions = scriptTag ? scriptTag.getAttribute('data-questions') : null;
    let faqQuestions = [];
    if(rawQuestions){
        try{
            let parsedQuestions = JSON.parse(rawQuestions);
            if(Array.isArray(parsedQuestions)){
                faqQuestions = parsedQuestions.filter(question => "string" == typeof question && question.trim()).map(question => question.trim()).slice(0,3);
            }
        }catch(_){}
    }
    let faqButtonsMarkup = faqQuestions.length ? `<span class="aida-faq-list_AIDACHATBOX">${faqQuestions.map((question,index)=>`<button class="aida-faq-btn_AIDACHATBOX" data-faq-question-index="${index}" data-faq-question="${question.replace(/"/g,"&quot;")}">${question}</button>`).join("")}</span>` : "";
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
        
        // Convert [content link](address link) to <button class="markdown-link-button">content link</button>
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<button class="markdown-link-button" data-href="$2">$1</button>');
        
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
          box-sizing: border-box !important;
          direction: rtl !important;
      }

      #aida-chatbot-container {
          background-color: transparent !important;
      }

      /*todo chatbot */
      .chatbot-toggler_AIDACHATBOX {
          position: fixed !important;
          ${positionChatbox === 'left' ? 'left: 40px !important;' : 'right: 40px !important;'}
          bottom: 35px !important;
          height: 50px !important;
          width: 50px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background-color: #00AF9E !important;
          border-radius: 50% !important;
          border: none !important;
          outline: none !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          z-index: 9999999 !important;
          padding: 1px 6px !important;
      }
      .chat-unread-badge_AIDACHATBOX {
          position: absolute !important;
          top: -4px !important;
          right: -4px !important;
          width: 18px !important;
          height: 18px !important;
          background: #ff3b30 !important;
          color: #fff !important;
          font-size: 11px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 2px solid #fff !important;
          z-index: 999999 !important;
      }
      #aida-chatbot-container.show-chatbot .chat-unread-badge_AIDACHATBOX,
      #aida-chatbot-container.unread-cleared_AIDACHATBOX .chat-unread-badge_AIDACHATBOX {
          display: none !important;
      }
      .chatbot-toggler_AIDACHATBOX::before {
          content: "" !important;
          position: absolute !important;
          inset: -8px !important;
          border-radius: 50% !important;
          border: 2px solid rgba(0, 179, 159, 0.45) !important;
          animation: ring_AIDACHATBOX 1.8s infinite !important;
          pointer-events: none !important;
      }
      #aida-chatbot-container.show-chatbot .chatbot-toggler_AIDACHATBOX::before {
          animation: none !important;
          opacity: 0 !important;
      }
      .chatbot-toggler_AIDACHATBOX.attention_AIDACHATBOX {
          animation: shake_AIDACHATBOX 0.55s ease !important;
      }
      #aida-chatbot-container:not(.show-chatbot) .chatbot-toggler_AIDACHATBOX {
          animation: shakeLoop_AIDACHATBOX 5s infinite !important;
      }
      #aida-chatbot-container.show-chatbot .chatbot-toggler_AIDACHATBOX {
          animation: none !important;
      }
      .chat-tooltip_AIDACHATBOX {
          position: fixed !important;
          ${positionChatbox === 'left' ? 'left: 110px !important;' : 'right: 110px !important;'}
          bottom: 34px !important;
          background: #222 !important;
          color: white !important;
          padding: 12px 16px !important;
          border-radius: 16px !important;
          font-size: 15px !important;
          line-height: 1.8 !important;
          z-index: 9999999 !important;
          white-space: nowrap !important;
          opacity: 0 !important;
          ${positionChatbox === 'left' ? 'transform: translateX(-12px) !important;' : 'transform: translateX(12px) !important;'}
          transition: 0.35s !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
          pointer-events: none !important;
      }
      .chat-tooltip_AIDACHATBOX.show_AIDACHATBOX {
          opacity: 1 !important;
          transform: translateX(0) !important;
      }
      .chat-tooltip_AIDACHATBOX::after {
          content: "" !important;
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          border-style: solid !important;
      }
      ${positionChatbox === 'left'
        ? `.chat-tooltip_AIDACHATBOX::after { left: -7px !important; border-width: 7px 7px 7px 0 !important; border-color: transparent #222 transparent transparent !important; }`
        : `.chat-tooltip_AIDACHATBOX::after { right: -6px !important; border-width: 7px 0 7px 7px !important; border-color: transparent transparent transparent #222 !important; }`}
      .chat-tooltip_AIDACHATBOX strong {
          color: #00e0c6 !important;
      }
      ${initialState === 'open' ? `#aida-chatbot-container.show-chatbot .chat-tooltip_AIDACHATBOX,
      #aida-chatbot-container.show-chatbot .chat-tooltip_AIDACHATBOX.show_AIDACHATBOX {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
      }` : ''}
      @keyframes ring_AIDACHATBOX {
          0% {
              transform: scale(0.85);
              opacity: 0.8;
          }
          100% {
              transform: scale(1.35);
              opacity: 0;
          }
      }
      @keyframes shake_AIDACHATBOX {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(8deg); }
          40% { transform: rotate(-8deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
      }
      @keyframes shakeLoop_AIDACHATBOX {
          0%, 2%, 4%, 6%, 8%, 10%, 100% { transform: rotate(0deg); }
          1% { transform: rotate(8deg); }
          3% { transform: rotate(-8deg); }
          5% { transform: rotate(5deg); }
          7% { transform: rotate(-5deg); }
      }
      .show-chatbot .chatbot-toggler_AIDACHATBOX {
          transform: rotate(90deg) !important;
      }
      .chatbot-toggler_AIDACHATBOX .img1_AIDACHATBOX , .img2_AIDACHATBOX{
          position: absolute !important;
      }
      .show-chatbot .chatbot-toggler_AIDACHATBOX .img1_AIDACHATBOX,
      .chatbot-toggler_AIDACHATBOX .img2_AIDACHATBOX {
          opacity: 0 !important;
      }
      .show-chatbot .chatbot-toggler_AIDACHATBOX .img2_AIDACHATBOX {
          opacity: 1 !important;
      }
      .chatbot_AIDACHATBOX {
          transform: scale(0.5) !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: fixed !important;
          ${positionChatbox === 'left' ? 'left: 40px !important;' : 'right: 40px !important;'}
          bottom: 100px !important;
          width: 420px !important;
          overflow: hidden !important;
          background-color: #fff !important;
          border-radius: 15px !important;
          transform-origin: bottom ${positionChatbox === 'left' ? 'left' : 'right'} !important;
          box-shadow: 0 0 128px 0 rgba(0, 0, 0, 0.1), 0 32px 64px -48px rgba(0, 0, 0, 0.5) !important;
          transition: all 0.1s ease !important;
          z-index: 99999999 !important;
      }
      .show-chatbot .chatbot_AIDACHATBOX {
          transform: scale(1) !important;
          opacity: 1 !important;
          pointer-events: auto !important;

      }
      .svg_bot_AIDACHATBOX {
          width: 32px !important;
          align-self: flex-end !important;
          background: white !important;
          text-align: center !important;
          line-height: 32px !important;
          border-radius: 4px !important;
          margin: 0 10px 7px 0 !important;
      }
      .chatbot_AIDACHATBOX header {
          background-color: #00AF9E !important;
          padding: 16px 0 !important;
          text-align: center !important;
          position: relative !important;
      }

      .chatbot_AIDACHATBOX header h2 {
          margin: 0 !important;
          color: #fff !important;
          font-size: 1.4rem !important;
      }
      .chatbot-close_AIDACHATBOX {
          position: absolute !important;
          right: 20px !important;
          top: 50% !important;
          background-color: #00AF9E !important;
          border: none !important;
          outline: none !important;
          cursor: pointer !important;
          display: none !important;
          transform: translateY(-50%) !important;
      }
      .clear-chat-history_AIDACHATBOX {
          position: absolute !important;
          left: 20px !important;
          top: 30% !important;
          background-color: #00AF9E !important;
          border: none !important;
          outline: none !important;
          cursor: pointer !important;
          padding: 1px 6px !important;
      }
      .chatbot_AIDACHATBOX .chatbox_AIDACHATBOX {
          max-height: 60vh !important;
          height: 510px !important;
          overflow-y: auto !important;
          padding: 20px 20px !important;
          margin:0 !important;
      }
      .chatbox_AIDACHATBOX .chat_AIDACHATBOX {
          display: flex !important;
      }
      .chatbox_AIDACHATBOX .outgoing_AIDACHATBOX {
          margin: 15px 0 !important;
          justify-content: flex-start !important;
      }
      .chatbox_AIDACHATBOX .incoming_AIDACHATBOX {
          margin: 15px 0 !important;
          justify-content: flex-end !important;
      }
      .chatbox_AIDACHATBOX .chat_AIDACHATBOX p {
          color: #fff !important;
          max-width: 75% !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          white-space: pre-wrap !important;
          font-size: 0.95rem !important;
          padding: 12px 16px !important;
          border-radius: 10px 10px 0 10px !important;
          background-color: #00AF9E !important;
          margin: 0 !important;
          line-height: 1.6 !important;
      }
      .chatbot_AIDACHATBOX .chat_AIDACHATBOX p.error-mes {
          color: rgb(185, 6, 6) !important;
          background-color: rgba(238, 151, 151, 0.635) !important;
      }
      .chatbox_AIDACHATBOX .incoming_AIDACHATBOX p {
          color: #000 !important;
          background-color: #f2f2f2 !important;
          border-radius: 10px 10px 10px 0 !important;
          line-height: 1.6 !important;
      }
      .chatbox_AIDACHATBOX .incoming_AIDACHATBOX p p {
        padding:0 !important;
      }
      .chatbot_AIDACHATBOX .chat-input_AIDACHATBOX {
          bottom: 0vh !important;
          width: 100% !important;
          display: flex !important;
          gap: 5px !important;
          background-color: #fff !important;
          padding: 8px 20px !important;
          border-top: 1px solid #ccc !important;
      }
      .chat-input_AIDACHATBOX textarea {
          height: 55px !important;
          width: 100% !important;
          max-height: 180px !important;
          border: none !important;
          outline: none !important;
          font-size: 0.95rem !important;
          resize: none !important;
          padding: 16px 15px 16px 0 !important;
      }
      .chat-input_AIDACHATBOX button {
          background-color: white !important;
          align-self: flex-end !important;
          height: 55px !important;
          line-height: 55px !important;
          font-size: 1.35rem !important;
          cursor: pointer !important;
          border: none !important;
          outline: none !important;
          visibility: hidden !important;
      }
      .chat-input_AIDACHATBOX textarea:valid ~ button {
          visibility: visible !important;
      }

      .send-btn_AIDACHATBOX {
          padding: 1px 6px !important;
      }
      
      /* Markdown link button styles */
      #aida-chatbot-container .markdown-link-button {
          width: 100% !important;
          border: 1px solid gray !important;
          padding: 8px 12px !important;
          background-color: transparent !important;
          cursor: pointer !important;
          text-align: center !important;
          font-size: inherit !important;
          font-family: inherit !important;
          margin: 5px 0 !important;
          border-radius: 4px !important;
          transition: background-color 0.2s ease !important;
      }
      #aida-chatbot-container .markdown-link-button:hover {
          background-color: #f0f0f0 !important;
      }
      .aida-faq-list_AIDACHATBOX {
          display: block !important;
          width: 100% !important;
          margin-top: 12px !important;
      }
      .aida-faq-btn_AIDACHATBOX {
          display: block !important;
          width: 100% !important;
          border: 1px solid #00AF9E !important;
          border-radius: 8px !important;
          background: #fff !important;
          color: #00AF9E !important;
          text-align: right !important;
          padding: 9px 12px !important;
          font-size: 13px !important;
          line-height: 1.6 !important;
          cursor: pointer !important;
          transition: all .2s ease !important;
          margin-top: 8px !important;
      }
      .aida-faq-btn_AIDACHATBOX:hover {
          background: #e8f7f4 !important;
      }

      .chat-aida-AIDACHATBOX {
          display: flex !important;
          align-item: center !important;
          justify-content: center !important;
          gap: 5px !important;
      }
      
      .chat-aida-AIDACHATBOX img{
          width: 25px !important;
          hight: 15px !important;
      }
    
      .chat-aida-AIDACHATBOX p{
          font-size: 12px !important;
          margin: 8px 0 5px 0 !important;
      }

      .aida_link_AIDACHATBOX {
          text-decoration: none !important;
          display: block !important;
          color: black !important;
      }

      .aida-processing-pending_AIDACHATBOX .aida-processing-shell_AIDACHATBOX {
          width: 80% !important;
          max-width: 80% !important;
          flex: 0 0 auto !important;
          align-self: flex-end !important;
      }
      .aida-processing-card_AIDACHATBOX {
          width: 100% !important;
          background: #fff !important;
          border-radius: 22px !important;
          border: 1px solid rgba(0, 175, 158, 0.22) !important;
          padding: 20px 22px !important;
          position: relative !important;
          overflow: hidden !important;
          isolation: isolate !important;
      }
      .aida-processing-card_AIDACHATBOX::before {
          content: "" !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 55% !important;
          height: 100% !important;
          background: linear-gradient(90deg, transparent, rgba(0, 175, 158, 0.13), transparent) !important;
          transform: translate3d(-130%, 0, 0) !important;
          animation: aida_shimmer_AIDACHATBOX 2.4s ease-in-out infinite !important;
          pointer-events: none !important;
          z-index: 0 !important;
      }
      @keyframes aida_shimmer_AIDACHATBOX {
          0% { transform: translate3d(-130%, 0, 0); }
          100% { transform: translate3d(260%, 0, 0); }
      }
      .aida-processing-top_AIDACHATBOX {
          margin-bottom: 18px !important;
          position: relative !important;
          z-index: 1 !important;
          text-align: right !important;
      }
      .aida-processing-title_AIDACHATBOX {
          font-size: 14px !important;
          font-weight: 800 !important;
          color: #009b86 !important;
          line-height: 1.5 !important;
      }
      .aida-processing-subtitle_AIDACHATBOX {
          font-size: 13px !important;
          color: #777 !important;
          margin-top: 8px !important;
          line-height: 1.65 !important;
      }
      .aida-progress-wrap_AIDACHATBOX {
          height: 8px !important;
          background: #e8f7f4 !important;
          border-radius: 30px !important;
          overflow: hidden !important;
          margin: 18px 0 !important;
          position: relative !important;
          z-index: 1 !important;
      }
      .aida-progress-bar_AIDACHATBOX {
          display: block !important;
          height: 100% !important;
          width: 38% !important;
          background: linear-gradient(90deg, transparent, rgba(0, 175, 158, 0.35), rgba(0, 212, 184, 0.35), transparent) !important;
          border-radius: 30px !important;
          opacity: 0.9 !important;
          will-change: transform !important;
          animation: aida_infiniteProgress_AIDACHATBOX 1.25s ease-in-out infinite !important;
      }
      @keyframes aida_infiniteProgress_AIDACHATBOX {
          0% { transform: translate3d(120%, 0, 0); }
          100% { transform: translate3d(-320%, 0, 0); }
      }
      .aida-msg-hidden_AIDACHATBOX {
          display: none !important;
      }

      @media only screen and (max-width: 480px) {
          /*todo chatbot */
          .chatbot_AIDACHATBOX {
              right: 0px !important;
              left: 0px !important;
              top: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              height: 100dvh !important;
              max-height: 100vh !important;
              max-height: 100dvh !important;
              border-radius: 0 !important;
              display: flex !important;
              flex-direction: column !important;
          }
          .chatbot_AIDACHATBOX header {
              flex-shrink: 0 !important;
          }
          .chatbot_AIDACHATBOX .chatbox_AIDACHATBOX {
              flex: 1 1 0 !important;
              min-height: 0 !important;
              height: auto !important;
              max-height: none !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
              padding-bottom: 160px !important;
          }
          .chatbot_AIDACHATBOX .aida_link_AIDACHATBOX {
              position: fixed !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 71px !important;
              z-index: 10 !important;
              flex-shrink: 0 !important;
              margin-top: auto !important;
              background-color: #fff !important;
          }
          .chatbot_AIDACHATBOX .chat-input_AIDACHATBOX {
              position: fixed !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              z-index: 10 !important;
              flex-shrink: 0 !important;
          }
          .chatbot_AIDACHATBOX header button {
              display: block !important;
          }
          body:has(.show-chatbot) {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
        }
      }
      @media only screen and (max-height: 600px) {
          .chatbot-toggler_AIDACHATBOX {
              bottom: 5px !important;
          }
          .chatbot_AIDACHATBOX {
              right: 0px !important;
              left: 0px !important;
              top: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              height: 100dvh !important;
              max-height: 100vh !important;
              max-height: 100dvh !important;
              border-radius: 0 !important;
              display: flex !important;
              flex-direction: column !important;
          }
          .chatbot_AIDACHATBOX header {
              flex-shrink: 0 !important;
          }
          .chatbot_AIDACHATBOX .chatbox_AIDACHATBOX {
              flex: 1 1 0 !important;
              min-height: 0 !important;
              height: auto !important;
              max-height: none !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
              padding-bottom: 160px !important;
          }
          .chatbot_AIDACHATBOX .aida_link_AIDACHATBOX {
              position: fixed !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 71px !important;
              z-index: 10 !important;
              flex-shrink: 0 !important;
              margin-top: auto !important;
              background-color: #fff !important;
          }
          .chatbot_AIDACHATBOX .chat-input_AIDACHATBOX {
              position: fixed !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              z-index: 10 !important;
              flex-shrink: 0 !important;
          }
          .chatbot_AIDACHATBOX header button {
              display: block !important;
          }
          body:has(.show-chatbot) {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
        }
      }
    </style>
    <div class="chat-tooltip_AIDACHATBOX" id="chatTooltip_AIDACHATBOX">
      <strong>نیاز به راهنمایی داری؟</strong><br>
      همین الان پیام بده 👋
    </div>
    <button class="chatbot-toggler_AIDACHATBOX">
      <span class="chat-unread-badge_AIDACHATBOX">1</span>
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
          <p class="bot-text_AIDACHATBOX">سلام به شما :) <br>چطور میتونم کمکتون کنم؟${faqButtonsMarkup}</p>

          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMf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" class="svg_bot_AIDACHATBOX">
        </li>
      </ul>
      <a href="https://aidasales.ir?utm_source=chatbox&utm_medium=website" target="_blank" class="aida_link_AIDACHATBOX">
        <div class="chat-aida-AIDACHATBOX">
           <p>قدرت گرفته از</p>
           <img src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MTguNjYgMjg3LjUxIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzAwYWY5ZTt9PC9zdHlsZT48L2RlZnM+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzI2LjIxLDE5OC4yMWMtMjMuOC43Ny00Mi45NSwxMi01NS44NSwzMi4yOC0xMiwxOC44NC0yNi42MywzNC41NS00Ny4wNiw0NC4zNmExMDkuNjgsMTA5LjY4LDAsMCwxLTQ3LjYyLDExLjMzYy01MC40NS4xOC00Ny42Ny4xLTk4LjEyLjA2LTEyLjcxLDAtMTYuNjgtNS40NS0xMy4xMy0xNy42NiwzLjQzLTExLjg0LDEzLTE4LjY3LDI2LjkzLTE4LjcsNDUuMy0uMDksMzcuMzctLjE5LDgyLjY3LDAsMjYuNDYuMTMsNDYuOS0xMSw2MC44OS0zMi45LDEzLTIwLjMyLDI5LjIyLTM2LjQ1LDUxLjQ3LTQ2LjA2YTEwNC44NywxMDQuODcsMCwwLDEsNDEuMTgtOWM2Mi4yOS0uMjksNTcuMDUtLjE2LDExOS4zNS0uMSwxNiwwLDI0LjI4LDExLDE5LjM0LDI1LjMxLTIuNTksNy40OS04LjYsMTEuMDktMTkuMTgsMTEuMTFDNDE1LjY4LDE5OC4zNywzNTcuNTgsMTk3LjIxLDMyNi4yMSwxOTguMjFaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTc2Ljg3LDY4LjYyYzcuMzMsMTEuODMsMTguMTgsMTYuMzksMzAuMDYsMTMuMSwxMi4yNi0zLjQsMTQuOC05LjYzLDguMTMtMjAuNDVsLTguMjMtMTNjLTEyLTE4Ljg1LTIwLjczLTI3LTQxLjE2LTM2LjhBMTA5Ljg2LDEwOS44NiwwLDAsMCw1MTguMDUuMTFDNDY3LjYtLjA3LDQ3MC4zOCwwLDQxOS45My4wNWMtMTIuNzEsMC0xNi42OCw1LjQ1LTEzLjEzLDE3LjY2LDMuNDMsMTEuODQsMTMsMTguNjcsMjYuOTMsMTguNyw0NS4zLjA5LDM3LjM3LjE5LDgyLjY3LDAsMjYuNDYtLjEzLDQ2LjksMTEuMDUsNjAuODksMzIuOSIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTI4Ny41OSwxNDdjLTEzLDQuMzctMjMuNCw5LjM2LTMyLjYyLDE2LjQ4LTMuMzgsMi42MS01LjMzLDEuODItNy40OC0xLjIzLTQtNS42Ni04LjQ0LTExLTEyLjE3LTE2Ljg3cS0yMi0zNC4zMi02Mi41Ni0zNC41NGMtNDUuMjgtLjE3LTM3LjMzLDAtODIuNjItLjA4LTE1LjU2LDAtMjYtOS0yNy43OC0yMy4zMi0xLjA5LTksMi44NS0xNCwxMS44OS0xNCw1My43OC0uMDcsNTQuMzQtLjkzLDEwOC4wOC40MiwzNS42Ni45LDYzLjc4LDE4LjI4LDgzLjg4LDQ3Ljc4QzI3Mi4yNywxMzAuNTYsMjc4LDEzOS41NiwyODcuNTksMTQ
           3WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTAsMTc5LjM3cTAtNDYuMzIsMC05Mi42NGMwLTEzLDUuNy0xNy4xNiwxOC4wNS0xMy4zOCwxMS40OSwzLjUyLDE5LjI4LDEzLjcsMTkuMzIsMjYuODVxLjI3LDc5LjE0LDAsMTU4LjI2YzAsMTQuMTEtOC42OCwyNC41Ny0yMS41LDI3LjUyQzUuMzgsMjg4LjQuMDcsMjg0LjM2LDAsMjczLjU1LDAsMjQyLjE2LDAsMjEwLjc2LDAsMTc5LjM3WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQ5My4zNiwxNzkuMzdxMC00Ni4zMiwwLTkyLjY0YzAtMTMsNS43LTE3LjE2LDE4LjA1LTEzLjM4LDExLjQ5LDMuNTIsMTkuMjgsMTMuNywxOS4zMiwyNi44NXEuMjgsNzkuMTQsMCwxNTguMjZjLS4wNSwxNC4xMS04LjY3LDI0LjU3LTIxLjUsMjcuNTItMTAuNTEsMi40Mi0xNS44Mi0xLjYyLTE1Ljg1LTEyLjQzQzQ5My4zMSwyNDIuMTYsNDkzLjM2LDIxMC43Niw0OTMuMzYsMTc5LjM3WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQzMy4yMiwyNTAuNjlINDA2LjExdjBsLTM1LjY2LDBIMzY4bC0xMS4yNiwwYy0xMy45MSwwLTIzLjQ5LDcuMjYtMjYuOTMsMTkuMS0zLjU0LDEyLjIyLjQyLDE3LjY1LDEzLjE0LDE3LjY2bDI0LjksMGg2NS40YTE4LjQxLDE4LjQxLDAsMCwwLDAtMzYuODJaIi8+PC9zdmc+">
        </div>
      </a>
      <div class="chat-input_AIDACHATBOX">
        <textarea placeholder="سوالت رو اینجا بنویس…" required></textarea>
        <button class="send-btn_AIDACHATBOX">
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" class="img5_AIDACHATBOX" viewBox="0 0 24 24" fill="none" transform="matrix(-1, 0, 0, 1, 0, 0)">
            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="SVGRepo_iconCarrier"> <path d="M9.51002 4.23001L18.07 8.51001C21.91 10.43 21.91 13.57 18.07 15.49L9.51002 19.77C3.75002 22.65 1.40002 20.29 4.28002 14.54L5.15002 12.81C5.37002 12.37 5.37002 11.64 5.15002 11.2L4.28002 9.46001C1.40002 3.71001 3.76002 1.35001 9.51002 4.23001Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M5.44 12H10.84" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
          </svg>
        </button>
      </div>
    </section>
  `,document.body.appendChild(t);let e=t.querySelector(".chat-input_AIDACHATBOX textarea"),o=t.querySelector(".send-btn_AIDACHATBOX"),a=t.querySelector(".chatbox_AIDACHATBOX"),i=t.querySelector(".chatbot-toggler_AIDACHATBOX"),r=t.querySelector(".chatbot-close_AIDACHATBOX"),s=t.querySelector(".clear-chat-history_AIDACHATBOX"),tooltip=t.querySelector("#chatTooltip_AIDACHATBOX"),attentionInterval=null,attentionTimeout=null,tooltipDismissed=!1,n=JSON.parse(localStorage.getItem("chatHistory"))||[],welcomeDone=!1,autoOpenT=null,c="",l=e.scrollHeight,h=(t,e)=>{let o=document.createElement("li");o.classList.add("chat_AIDACHATBOX",e);let a="outgoing_AIDACHATBOX"===e?`<p>${t}</p>`:`<p>${"incoming_AIDACHATBOX"===e?parseMarkdown(t):t}</p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN
  5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW
  5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMfICEpKQqvn8uancoAAAADdFJOU/AD2OyXvisAAA1SSURBVHja1Zy9jiS3Ecf/tdgSoI3mgKEBOXLig7VPUQbkvA6oEixFigR4n2IewYkE30UTHfb4lA740c1usrtnVoKtSW53tvvXxWKxvsg++M7HHt+FjT8rdu4XAKD7AQIAQLgXoOn+DRF2AMAjABLcCVCQAY/w8Ri2AYArHglB+C6AIrieH0nYcBdA4C5nJiW/DwC4izEMLuEOgIHcYSSOoHwHQMHuZCRBgtEdADmxGxlpUB4qYQsACW7kpGw0VMIGwEiCGzsZG/nIEjYAynBXdjJ2uN4OEIa7Bicjh4+0uAUIVAESRlrcAMDI052/AUDDaBrGACNjd3FHUqHeDOAMkAzgGwHKVQJxuwugRQJxI7ebAUHZHb8RwGlkSWOAzADhLoC3AP+jA/DHlMDeKkFdTP8XErwR4HcC6G2AkAG4G+A0dyg3AzQ4sldODuVtAL
          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" class="svg_bot_AIDACHATBOX">`;return o.innerHTML=a,o};const aidaFinalizeProcessingUI=chatEl=>{const shell=chatEl.querySelector(".aida-processing-shell_AIDACHATBOX");shell&&shell.remove();chatEl.classList.remove("aida-processing-pending_AIDACHATBOX");const msg=chatEl.querySelector("p.aida-bot-msg-body_AIDACHATBOX")||chatEl.querySelector("p");msg&&msg.classList.remove("aida-msg-hidden_AIDACHATBOX")};const createProcessingPlaceholder=()=>{const tmpLi=h(" ","incoming_AIDACHATBOX");const imgEl=tmpLi.querySelector("img.svg_bot_AIDACHATBOX");const avatarHtml=imgEl?imgEl.outerHTML:"";tmpLi.remove();const li=document.createElement("li");li.classList.add("chat_AIDACHATBOX","incoming_AIDACHATBOX","aida-processing-pending_AIDACHATBOX");
          li.innerHTML='<div class="aida-processing-shell_AIDACHATBOX"><div class="aida-processing-card_AIDACHATBOX"><div class="aida-processing-top_AIDACHATBOX"><div class="aida-processing-title_AIDACHATBOX">پیام دریافت شد</div><div class="aida-processing-subtitle_AIDACHATBOX">آیدا در حال بررسی سوال شماست...</div></div><div class="aida-progress-wrap_AIDACHATBOX"><div class="aida-progress-bar_AIDACHATBOX"></div></div></div></div><p class="bot-text_AIDACHATBOX aida-bot-msg-body_AIDACHATBOX aida-msg-hidden_AIDACHATBOX"></p>'+avatarHtml;return li},u=(chatEl,correlationId)=>{let pollInterval=null;const checkResult=()=>{fetch(`https://api.aidasales.ir/api/v1/conversation/chatbox/result/${correlationId}`,{method:"GET",headers:{"Content-Type":"application/json"}}).then(res=>res.json()).then(data=>{if(data.status==="pending"){let stateText=data.agent_state&&String(data.agent_state).trim(),subtitleEl=chatEl.querySelector(".aida-processing-subtitle_AIDACHATBOX");stateText&&subtitleEl&&(subtitleEl.textContent=stateText);if(!pollInterval){pollInterval=setInterval(checkResult,5000)}}else{if(pollInterval){clearInterval(pollInterval);pollInterval=null}aidaFinalizeProcessingUI(chatEl);let e=chatEl.querySelector("p"),o=data.response||data.message||"";if(!o||o.trim()===""){e.classList.add("error-mes"),e.textContent="پاسخی دریافت نشد. لطفا دوباره تلاش کنید."}else{let parsedHtml=parseMarkdown(o);e.innerHTML=parsedHtml,n.push({sender:"bot",text:o}),localStorage.setItem("chatHistory",JSON.stringify(n)),t.classList.contains("show-chatbot")||(t.classList.remove("unread-cleared_AIDACHATBOX"),window.__aidaNotificationAudio||(window.__aidaNotificationAudio=new Audio("https://cdn.aidasales.ir/chatbox/audio/notification_voice.mp3"),window.__aidaNotificationAudio.preload="auto",window.__aidaNotificationAudio.load()),window.__aidaNotificationAudio.currentTime=0,window.__aidaNotificationAudio.play().catch(()=>{}))}a.scrollTo(0,a.scrollHeight)}}).catch(()=>{if(pollInterval){clearInterval(pollInterval);pollInterval=null}aidaFinalizeProcessingUI(chatEl);
          let e=chatEl.querySelector("p");e.classList.add("error-mes"),e.textContent="مشکلی به وجود آمده است. بعداً امتحان کنید.",a.scrollTo(0,a.scrollHeight)})};checkResult()},p=(chatEl,retry=0)=>{const MAX_RETRIES=2;let e=chatEl.querySelector("p.aida-bot-msg-body_AIDACHATBOX")||chatEl.querySelector("p");fetch(`https://api.aidasales.ir/api/v1/conversation/chatbox/${apiKey}/message`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:c,thread_id:window.location.href,username:uuidCookie})}).then(res=>res.json()).then(data=>{if(data.correlation_id){u(chatEl,data.correlation_id)}else{let o=data.response;if(!o||o===null||o.trim()===""){if(retry<MAX_RETRIES){setTimeout(()=>{p(chatEl,retry+1)},1000)}else{aidaFinalizeProcessingUI(chatEl);e=chatEl.querySelector("p");e.classList.add("error-mes"),e.textContent="پاسخی دریافت نشد. لطفا دوباره تلاش کنید."}}
          else{aidaFinalizeProcessingUI(chatEl);e=chatEl.querySelector("p");let parsedHtml=parseMarkdown(o);e.innerHTML=parsedHtml,n.push({sender:"bot",text:o}),localStorage.setItem("chatHistory",JSON.stringify(n)),t.classList.contains("show-chatbot")||(t.classList.remove("unread-cleared_AIDACHATBOX"),window.__aidaNotificationAudio||(window.__aidaNotificationAudio=new Audio("https://cdn.aidasales.ir/chatbox/audio/notification_voice.mp3"),window.__aidaNotificationAudio.preload="auto",window.__aidaNotificationAudio.load()),window.__aidaNotificationAudio.currentTime=0,window.__aidaNotificationAudio.play().catch(()=>{}))}}}).catch(()=>{if(retry<MAX_RETRIES){setTimeout(()=>{p(chatEl,retry+1)},1000)}else{aidaFinalizeProcessingUI(chatEl);e=chatEl.querySelector("p");e.classList.add("error-mes"),e.textContent="مشکلی به وجود آمده است. بعداً امتحان کنید."}}).finally(()=>a.scrollTo(0,a.scrollHeight))},d=(presetMessage="")=>{const faqMessage="string"==typeof presetMessage?presetMessage:"";if(!(c=(faqMessage||e.value).trim()))return;let t=h(c,"outgoing_AIDACHATBOX");a.appendChild(t),n.push({sender:"user",text:c}),localStorage.setItem("chatHistory",JSON.stringify(n)),faqMessage||(e.value="",e.style.height="55px"),a.scrollTo(0,a.scrollHeight),setTimeout(()=>{let t=createProcessingPlaceholder();a.appendChild(t),a.scrollTo(0,a.scrollHeight),p(t)},600)};
          e.addEventListener("input",()=>{e.style.height=`${l}px`,e.style.height=`${e.scrollHeight}px`}),e.addEventListener("keyup",t=>{"Enter"===t.key&&!t.shiftKey&&window.innerWidth>800&&(t.preventDefault(),d())}),o.addEventListener("click",()=>d());const typeWelcome=()=>{if(n.length>0||welcomeDone)return;const botGreet=a.querySelector(".bot-text_AIDACHATBOX");if(!botGreet)return;welcomeDone=!0,a.scrollTo(0,a.scrollHeight)};const toggleChatOpen=()=>{const wasOpen=t.classList.contains("show-chatbot");t.classList.toggle("show-chatbot");!wasOpen&&t.classList.contains("show-chatbot")&&(t.classList.add("unread-cleared_AIDACHATBOX"),tooltipDismissed=!0,tooltip&&tooltip.classList.remove("show_AIDACHATBOX"),attentionInterval&&(clearInterval(attentionInterval),attentionInterval=null),typeWelcome())};i.addEventListener("click",()=>{autoOpenT&&(clearTimeout(autoOpenT),autoOpenT=null),toggleChatOpen()}),r.addEventListener("click",toggleChatOpen),initialState!=="open"&&(autoOpenT=setTimeout(()=>{autoOpenT=null,t.classList.contains("show-chatbot")||(t.classList.add("show-chatbot"),t.classList.add("unread-cleared_AIDACHATBOX"),tooltipDismissed=!0,tooltip&&tooltip.classList.remove("show_AIDACHATBOX"),attentionInterval&&(clearInterval(attentionInterval),attentionInterval=null),typeWelcome())},3e4)),initialState==="open"&&!n.length&&typeWelcome(),s.addEventListener("click",()=>{n=[],localStorage.removeItem("chatHistory"),a.innerHTML=`<li class="chat_AIDACHATBOX incoming_AIDACHATBOX"><p class="bot-text_AIDACHATBOX">سلام به شما :) <br>چطور میتونم کمکتون کنم؟${faqButtonsMarkup}</p>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP4AAAE5AgMAAADNYnV6AAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEM0FDRkEwNDRGNkMxMUYwQjRGM0ZGQzZGQUQwMjc1NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjM3RDgwODRGNkYxMUYwQjRGM0ZGQzZGQUQwMjc1NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQzQUNGQTAyNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0IiBzdFJlZ
    jpkb2N1bWVudElEPSJ4bXAuZGlkOkQzQUNGQTAzNEY2QzExRjBCNEYzRkZDNkZBRDAyNzU0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSK1rgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAJUExURSMfICEpKQqvn8uancoAAAADdFJOU/AD2OyXvisAAA1SSURBVHja1Zy9jiS3Ecf/tdgSoI3mgKEBOXLig7VPUQbkvA6oEixFigR4n2IewYkE30UTHfb4lA740c1usrtnVoKtSW53tvvXxWKxvsg++M7HHt+FjT8rdu4XAKD7AQIAQLgXoOn+DRF2AMAjABLcCVCQAY/w8Ri2AYArHglB+C6AIrieH0nYcBdA4C5nJiW/DwC4izEMLuEOgIHcYSSOoHwHQMHuZCRBgtEdADmxGxlpUB4qYQsACW7kpGw0VMIGwEiCGzsZG/nIEjYAynBXdjJ2uN4OEIa7Bicjh4+0uAUIVAESRlrcAMDI052/AUDDaBrGACNjd3FHUqHeDOAMkAzgGwHKVQJxuwugRQJxI7ebAUHZHb8RwGlkSWOAzADhLoC3AP+jA/DHlMDeKkFdTP8XErwR4HcC6G2AkAG4G+A0dyg3AzQ4sldODuVtAL
          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" class="svg_bot_AIDACHATBOX"></li>`,e.style.height="55px",welcomeDone=!1,typeWelcome()}),n.forEach(t=>{let e=h(t.text||"مشکلی به وجود آمد.","user"===t.sender?"outgoing_AIDACHATBOX":"incoming_AIDACHATBOX");a.appendChild(e)})
          ,a.scrollTo(0,a.scrollHeight);const unreadBadge=i.querySelector(".chat-unread-badge_AIDACHATBOX"),canPlayInitialNotif=unreadBadge&&"none"!==window.getComputedStyle(unreadBadge).display&&!t.classList.contains("show-chatbot"),playNotificationSound=()=>{window.__aidaNotificationAudio||(window.__aidaNotificationAudio=new Audio("https://cdn.aidasales.ir/chatbox/audio/notification_voice.mp3"),window.__aidaNotificationAudio.preload="auto",window.__aidaNotificationAudio.load()),window.__aidaNotificationAudio.currentTime=0;let e=window.__aidaNotificationAudio.play();return e&&"function"==typeof e.catch?e.catch(()=>!1):Promise.resolve(!0)},playOnFirstInteraction=()=>{const e=()=>{playNotificationSound().catch(()=>{}),document.removeEventListener("click",e,!0),document.removeEventListener("touchstart",e,!0),document.removeEventListener("keydown",e,!0)};
          document.addEventListener("click",e,!0),document.addEventListener("touchstart",e,!0),document.addEventListener("keydown",e,!0)};canPlayInitialNotif&&playNotificationSound().catch(()=>{playOnFirstInteraction()});let lastIncomingCount=n.filter(msg=>"bot"===msg.sender).length,newIncomingSoundObserver=new MutationObserver(()=>{const currentIncomingCount=a.querySelectorAll(".incoming_AIDACHATBOX").length;if(currentIncomingCount>lastIncomingCount&&(lastIncomingCount=currentIncomingCount,!t.classList.contains("show-chatbot")))t.classList.remove("unread-cleared_AIDACHATBOX"),playNotificationSound().catch(()=>{playOnFirstInteraction()})});newIncomingSoundObserver.observe(a,{childList:!0});const triggerAttention=()=>{if(tooltipDismissed)return;!(initialState==="open"&&t.classList.contains("show-chatbot"))&&tooltip&&tooltip.classList.add("show_AIDACHATBOX"),i.classList.add("attention_AIDACHATBOX"),attentionTimeout&&clearTimeout(attentionTimeout),attentionTimeout=setTimeout(()=>{i.classList.remove("attention_AIDACHATBOX")},600)};setTimeout(triggerAttention,2e3),attentionInterval=setInterval(triggerAttention,5e3),i.addEventListener("click",()=>{tooltipDismissed=!0,tooltip&&tooltip.classList.remove("show_AIDACHATBOX"),attentionInterval&&(clearInterval(attentionInterval),attentionInterval=null)}),window.addEventListener("scroll",()=>{tooltip&&tooltip.classList.remove("show_AIDACHATBOX")}),t.addEventListener("click",(e)=>{if(e.target.classList.contains("markdown-link-button")){const href=e.target.getAttribute("data-href");if(href){window.open(href,"_blank")}}if(e.target.classList.contains("aida-faq-btn_AIDACHATBOX")){let question=e.target.getAttribute("data-faq-question")||"";question=question.replace(/&quot;/g,'"').trim();if(question){let faqWrap=e.target.closest(".aida-faq-list_AIDACHATBOX");faqWrap&&faqWrap.remove(),d(question)}}})}();