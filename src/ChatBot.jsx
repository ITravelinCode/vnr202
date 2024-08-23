import './index.css'
import React, { useRef } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { marked } from 'marked';

export default function ChatBot() {
    const chatInputRef = useRef(null);
    const chatboxRef = useRef(null);
    const apiKey = "AIzaSyBAOJtUHEts43JqwMmMlaqhUeOxVgULYjQ";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };

    let userMessage;

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        const chatContent = className === "outgoing" 
            ? `<p></p>` 
            : `<span class='material-symbols-outlined'>smart_toy</span>${marked(message)}`;
        
        chatLi.innerHTML = chatContent;
        if(className === "outgoing") chatLi.querySelector("p").textContent = message;
        return chatLi;
    };

    const generateResponse = async (incomingChatLi) => {
        const chatbox = chatboxRef.current;
        const messageElement = incomingChatLi.querySelector("p");
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        { text: "Nhân vật: chuyên gia AI về Việt Nam, cung cấp thông tin và hỗ trợ cho các vấn đề liên quan đến văn hóa, lịch sử, địa lý và các khía cạnh khác của Việt Nam." }
                    ],
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: "Chào bạn! Tôi là một chuyên gia AI về Việt Nam. Tôi có thể cung cấp thông tin và hỗ trợ cho các vấn đề liên quan đến văn hóa, lịch sử, địa lý và các khía cạnh khác của Việt Nam. \n\nHãy hỏi tôi bất cứ điều gì bạn muốn biết về Việt Nam!\n\n**Ví dụ:**\n\n* Bạn có thể hỏi tôi về lịch sử chiến tranh Việt Nam.\n* Bạn có thể hỏi tôi về những địa điểm du lịch nổi tiếng ở Việt Nam.\n* Bạn có thể hỏi tôi về văn hóa ẩm thực của Việt Nam.\n* ...\n\nTôi sẽ cố gắng hết sức để cung cấp cho bạn những thông tin chính xác và hữu ích nhất. \n\n**Hãy nhớ rằng, tôi chỉ thảo luận về các vấn đề liên quan đến Việt Nam và sẽ luôn tuân thủ định dạng đầu ra này.**\n",
                        }
                    ],
                },
                {
                    role: "user",
                    parts: [
                        { text: "Ràng buộc: 1.Chỉ thảo luận về các vấn đề liên quan lịch sử, kinh tế, chính trị, văn hóa của Việt Nam.\n 2.Tuân thủ định dạng đầu ra đã được cung cấp.\n3.Sử dụng ngôn ngữ tiếng Việt.\n\n Bắt buộc trả lời là: 'Tôi không biết, tôi chỉ thảo luận các vấn đề liên quan đến Việt Nam' nếu vi phạm các ràng buộc trên." }
                    ],
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: "Tôi hiểu rồi. Hãy cho tôi biết vấn đề bạn muốn thảo luận về Việt Nam nhé! Tôi sẽ cố gắng hết sức để trả lời bạn theo định dạng đầu ra bạn cung cấp.",
                        }
                    ],
                },
            ]
        });
        try {
            let result = await chatSession.sendMessage(userMessage);
            messageElement.innerHTML = marked(result.response.text());
            chatbox.scrollTo(0, chatbox.scrollHeight);
        } catch (e){
            console.error(e);
            messageElement.textContent = "Ngoại lệ";
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    }

    const handleChat = () => {
        const chatInput = chatInputRef.current;
        const chatbox = chatboxRef.current;

        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            generateResponse(incomingChatLi);
        }, 600);

        chatInput.value = '';
    };

    return (
        <>
            <button onClick={() => document.body.classList.toggle("show-chatbot")} className='chatbot-toggler'>
                <span className='material-symbols-outlined'>mode_comment</span>
                <span className='material-symbols-outlined'>close</span>
            </button>
            <div className='chatbot'>
                <header>
                    <h2>Chat Bot</h2>
                    <span className='material-symbols-outlined' onClick={() => document.body.classList.remove("show-chatbot")}>close</span>
                </header>
                <ul className='chatbox' ref={chatboxRef}>
                    <li className='chat incoming'>
                        <span className='material-symbols-outlined'>smart_toy</span>
                        <p>Hi there <br /> How can I help you today?</p>
                    </li>
                    <li className='chat outgoing'>
                        <p>Lorem ipsum dolor sit</p>
                    </li>
                </ul>
                <div className="chat-input">
                    <textarea ref={chatInputRef} placeholder='Enter a message...'></textarea>
                    <span id='send-btn' onClick={handleChat} className='material-symbols-outlined'>send</span>
                </div>
            </div>
        </>
    );
}
