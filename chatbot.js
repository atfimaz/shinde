// /* ===== SELECT ELEMENTS ===== */
// const messageInput = document.querySelector(".message-input");
// const chatbody = document.querySelector(".chat-body");
// const sendMessageButton = document.querySelector("#send-message");

// const chatbot = document.getElementById("chatbot");
// const openBtn = document.getElementById("open-chatbot");
// const closeBtn = document.getElementById("close-chatbot");

// /* ===== API CONFIG ===== */
// const API_KEY = "YOUR_GROQ_API_KEY"; // replace with your key via secure config
// const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// /* ===== USER DATA ===== */
// const userData = { message: null };

// /* ===== SIDEBAR TOGGLE ===== */
// openBtn?.addEventListener("click", () => {
//   chatbot.classList.toggle("open");
// });

// closeBtn?.addEventListener("click", () => {
//   chatbot.classList.remove("open");
// });

// /* ===== CREATE MESSAGE BUBBLE ===== */
// const createMessageElement = (content, ...classes) => {
//   const div = document.createElement("div");
//   div.classList.add("message", ...classes);
//   div.innerHTML = content;
//   return div;
// };

// /* ===== CALL GROQ API ===== */
// const getBotResponse = async (incomingMessageDiv) => {
//   const messageElement = incomingMessageDiv.querySelector(".message-text");

//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "llama-3.1-8b-instant",
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a medical dashboard assistant helping interpret patient vitals.",
//           },
//           {
//             role: "user",
//             content: userData.message,
//           },
//         ],
//         temperature: 0.7,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) throw new Error(data.error?.message || "API Error");

//     messageElement.innerText = data.choices[0].message.content.trim();
//   } catch (error) {
//     console.error(error);
//     messageElement.innerText = "Error: " + error.message;
//     messageElement.style.color = "red";
//   } finally {
//     incomingMessageDiv.classList.remove("thinking");
//     chatbody.scrollTo({
//       top: chatbody.scrollHeight,
//       behavior: "smooth",
//     });
//   }
// };

// /* ===== SEND USER MESSAGE ===== */
// const handleOutgoingMessage = (e) => {
//   e.preventDefault();

//   userData.message = messageInput.value.trim();
//   if (!userData.message) return;

//   messageInput.value = "";

//   /* user bubble */
//   const outgoingMessageDiv = createMessageElement(
//     `<div class="message-text"></div>`,
//     "user-message",
//   );

//   outgoingMessageDiv.querySelector(".message-text").innerText =
//     userData.message;

//   chatbody.appendChild(outgoingMessageDiv);

//   chatbody.scrollTo({
//     top: chatbody.scrollHeight,
//     behavior: "smooth",
//   });

//   /* typing indicator */
//   setTimeout(() => {
//     const incomingMessageDiv = createMessageElement(
//       `<div class="message-text">Typing...</div>`,
//       "bot-message",
//       "thinking",
//     );

//     chatbody.appendChild(incomingMessageDiv);

//     chatbody.scrollTo({
//       top: chatbody.scrollHeight,
//       behavior: "smooth",
//     });

//     getBotResponse(incomingMessageDiv);
//   }, 500);
// };

// /* ===== EVENT LISTENERS ===== */
// sendMessageButton?.addEventListener("click", handleOutgoingMessage);

// messageInput?.addEventListener("keydown", (e) => {
//   if (e.key === "Enter" && !e.shiftKey) {
//     e.preventDefault();
//     handleOutgoingMessage(e);
//   }
// });

/* ===== SELECT ELEMENTS ===== */
const messageInput = document.querySelector(".message-input");
const chatbody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");

const chatbot = document.getElementById("chatbot");
const openBtn = document.getElementById("open-chatbot");
const closeBtn = document.getElementById("close-chatbot");

/* ===== API CONFIG ===== */
const API_KEY = "YOUR_GROQ_API_KEY"; // replace with your key via secure config
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

/* ===== USER DATA ===== */
const userData = { message: null };

/* ===== SIDEBAR TOGGLE ===== */
openBtn?.addEventListener("click", () => chatbot.classList.toggle("open"));
closeBtn?.addEventListener("click", () => chatbot.classList.remove("open"));

/* ===== CREATE MESSAGE ===== */
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  if (content instanceof Node) {
    div.appendChild(content);
  } else {
    div.textContent = content;
  }
  return div;
};

/* ===== GET AI RESPONSE ===== */
const getBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: userData.message }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API Error");

    messageElement.innerText = data.choices[0].message.content.trim();
  } catch (error) {
    console.error(error);
    messageElement.innerText = "⚠️ Error: " + error.message;
    messageElement.style.color = "red";
  } finally {
    incomingMessageDiv.classList.remove("thinking");
    chatbody.scrollTo({
      top: chatbody.scrollHeight,
      behavior: "smooth",
    });
  }
};

/* ===== SEND MESSAGE ===== */
const handleOutgoingMessage = (e) => {
  e?.preventDefault();

  userData.message = messageInput.value.trim();
  if (!userData.message) return;

  messageInput.value = "";

  /* user bubble */
  const outgoingMessageText = document.createElement("div");
  outgoingMessageText.className = "message-text";
  outgoingMessageText.textContent = userData.message;
  const outgoingMessageDiv = createMessageElement(
    outgoingMessageText,
    "user-message",
  );

  chatbody.appendChild(outgoingMessageDiv);

  /* typing bubble */
  const incomingMessageText = document.createElement("div");
  incomingMessageText.className = "message-text";
  incomingMessageText.textContent = "Typing...";
  const incomingMessageDiv = createMessageElement(
    incomingMessageText,
    "bot-message",
    "thinking",
  );

  chatbody.appendChild(incomingMessageDiv);

  chatbody.scrollTo({
    top: chatbody.scrollHeight,
    behavior: "smooth",
  });

  getBotResponse(incomingMessageDiv);
};

/* ===== EVENTS ===== */
sendMessageButton?.addEventListener("click", handleOutgoingMessage);

messageInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleOutgoingMessage();
  }
});
