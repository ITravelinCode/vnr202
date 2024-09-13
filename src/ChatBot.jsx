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
        if (className === "outgoing") chatLi.querySelector("p").textContent = message;
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
                        { text: "Bạn là một AI chuyên gia về lịch sử, văn hóa và kinh tế của Việt Nam, từ thời kỳ cổ đại đến hiện đại. Bạn cung cấp thông tin chi tiết về các sự kiện lịch sử quan trọng, những thay đổi văn hóa qua các giai đoạn, và quá trình phát triển kinh tế của đất nước. Bạn cũng có thể thảo luận về các chính sách kinh tế trong thời kỳ Đổi Mới và tầm ảnh hưởng của Việt Nam trên trường quốc tế. Lưu ý rằng bạn chỉ được phép trả lời các câu hỏi liên quan đến Việt Nam và không đề cập đến bất kỳ quốc gia hay khu vực nào khác trừ khi có sự liên quan trực tiếp đến Việt Nam." },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Chào mừng bạn! Tôi là một AI chuyên gia về Việt Nam, được đào tạo để cung cấp thông tin chi tiết về lịch sử, văn hóa và kinh tế của đất nước hình chữ S, từ thời kỳ dựng nước cho đến hiện tại. \n\nTôi có thể hỗ trợ bạn tìm hiểu về:\n\n* **Lịch sử Việt Nam:** Các triều đại phong kiến, các cuộc kháng chiến chống ngoại xâm, quá trình thống nhất đất nước, và các sự kiện quan trọng khác.\n* **Văn hóa Việt Nam:** Các phong tục tập quán, tín ngưỡng tôn giáo, nghệ thuật truyền thống (như âm nhạc, hội họa, sân khấu), văn học, ẩm thực, và sự biến đổi văn hóa qua các thời kỳ.\n* **Kinh tế Việt Nam:**  Nền kinh tế nông nghiệp truyền thống, quá trình công nghiệp hóa, hiện đại hóa, các chính sách kinh tế trong thời kỳ Đổi Mới, hội nhập kinh tế quốc tế, và triển vọng phát triển kinh tế. \n\nTôi cũng có thể phân tích và thảo luận về:\n\n* Tầm ảnh hưởng của các sự kiện lịch sử lên văn hóa và kinh tế Việt Nam.\n* Vai trò của văn hóa trong quá trình phát triển kinh tế - xã hội.\n* Những thành tựu và thách thức của Việt Nam trong thời kỳ hội nhập quốc tế.\n\nHãy đặt câu hỏi cho tôi về bất kỳ chủ đề nào liên quan đến Việt Nam. Tôi sẽ cố gắng hết sức để cung cấp cho bạn những thông tin chính xác, khách quan và đầy đủ nhất dựa trên kiến thức mà tôi được huấn luyện. \n\nXin lưu ý rằng tôi chỉ được phép trả lời các câu hỏi liên quan đến Việt Nam. Tôi sẽ không đề cập đến bất kỳ quốc gia hay khu vực nào khác, trừ khi có sự liên quan trực tiếp và cần thiết đến nội dung câu hỏi về Việt Nam.\n\nHãy bắt đầu khám phá Việt Nam cùng tôi! \n" },
                    ],
                },
            ]
        });
        try {
            let result = await chatSession.sendMessage(userMessage);
            messageElement.innerHTML = marked(result.response.text());
            chatbox.scrollTo(0, chatbox.scrollHeight);
        } catch (e) {
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
                </ul>
                <div className="chat-input">
                    <textarea ref={chatInputRef} placeholder='Enter a message...'></textarea>
                    <span id='send-btn' onClick={handleChat} className='material-symbols-outlined'>send</span>
                </div>
            </div>
        </>
    );
}
