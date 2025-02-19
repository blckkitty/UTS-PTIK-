const chatbody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const urlParams = new URLSearchParams(window.location.search);
const examCompleted = urlParams.get('examComplete');
const userName = urlParams.get('name');
const userScore = urlParams.get('score');


const API_KEY = "AIzaSyBfAjuvJjVI7flaj89QttF7H_PAzNdwv90";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

if(examCompleted && userName && userScore) {
    const resultMessage = `
        <div class="message-text">
            <strong>Hasil Ujian ${userName}:</strong><br>
            Skor: ${userScore}/100<br>
            ${userScore >= 70 ? '🎉 Selamat! Anda lulus!' : ' Maaf, silakan coba lagi!'}
        </div>
    `;}

// Fungsi untuk membuat elemen pesan dynamic
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Respon bot menggunakan API(AI)
const generateBotResponse = async (incomingMessageDiv, userMessage) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ "text": userMessage }]
            }]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error?.message || "API request failed");
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Invalid API response");

        const apiResponseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*/g, "")
            .trim();
            
        messageElement.innerHTML = apiResponseText;
    } catch (error) {
        console.error(error);
        messageElement.innerHTML = error.message;
        messageElement.style.color = "#ff0000";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });
    }
}

window.addEventListener('load', () => {
    const hasil = JSON.parse(localStorage.getItem('hasilUjian'));
    if(hasil) {
        showExamResult(hasil);
        localStorage.removeItem('hasilUjian');
    }
});

function showExamResult(result) {
    const resultMessage = `
        <div class="message bot-message">
            <svg class="bot-avatar" ...></svg>
            <div class="message-text">
                <h3>🎉 Hasil Ujian 🎉</h3>
                <p>📛 Nama: ${result.nama}</p>
                <p>💯 Skor: ${result.score}/100</p>
                <p>⏱ Waktu: ${result.duration}</p>
                <div class="feedback-box">
                    <h4>📌 Feedback:</h4>
                    ${marked.parse(result.feedback)}
                </div>
            </div>
        </div>`;
    
    chatbody.insertAdjacentHTML('beforeend', resultMessage);
    chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: 'smooth' });
}

// Pesan keluar user
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message.toLowerCase() === "mulai uts") {
        const storedName = localStorage.getItem('examUserName');
        window.location.href = `nama.html${storedName ? `?name=${encodeURIComponent(storedName)}` : ''}`;
        messageInput.value = "";
        return;
    }
    
    // Handle perintah khusus
    if (message.toLowerCase() === "mulai uts") {
        window.location.href = "uts-form.html";
        messageInput.value = "";
        return;
    }

    // Membuat pesan user
    const userMessageContent = `<div class="message-text">${message}</div>`;
    const outgoingMessageDiv = createMessageElement(userMessageContent, "user-message");
    chatbody.appendChild(outgoingMessageDiv);
    messageInput.value = "";

    // Membuat pesan bot
    setTimeout(() => {
        const botMessageContent = `
            <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                <path d="M22.078 8.347a1.4 1.4 0 0 0-.488-.325V4.647a.717.717 0 0 0-.717-.717a.727.727 0 0 0-.717.717V7.85h-.21a5.48 5.48 0 0 0-5.25-3.92H9.427a5.48 5.48 0 0 0-5.25 3.92H3.9V4.647a.717.717 0 1 0-1.434 0v3.385a1.5 1.5 0 0 0-.469.315A1.72 1.72 0 0 0 1.5 9.552v4.896a1.7 1.7 0 0 0 1.702 1.702h.956a5.48 5.48 0 0 0 5.25 3.92h5.183a5.48 5.48 0 0 0 5.25-3.92h.955a1.7 1.7 0 0 0 1.702-1.702V9.552c.02-.44-.131-.872-.42-1.205M3.996 14.716H3.24a.27.27 0 0 1-.191-.077a.3.3 0 0 1-.076-.191V9.552a.26.26 0 0 1 .248-.268h.775a.6.6 0 0 0 0 .125v5.182a.6.6 0 0 0 0 .125m4.303-3.232V8.902a.813.813 0 1 1 1.616 0v2.582a.813.813 0 1 1-1.616 0m5.737 4.78h-3.92a.812.812 0 1 1 0-1.625h3.92a.813.813 0 0 1 0 1.626m1.788-4.78a.813.813 0 1 1-1.626 0V8.902a.813.813 0 0 1 1.626 0zm5.345 2.964c0 .07-.028.14-.076.191a.27.27 0 0 1-.192.077h-.755a.6.6 0 0 0 0-.125v-5.22a.6.6 0 0 0 0-.125h.765a.25.25 0 0 1 .182.077c.048.052.075.12.076.19z"/>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
        chatbody.appendChild(incomingMessageDiv);
        generateBotResponse(incomingMessageDiv, message);
    }, 600);

    chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });
}

// Event listeners
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingMessage(e);
    }
});

sendMessageButton.addEventListener("click", handleOutgoingMessage);