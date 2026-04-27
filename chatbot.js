/* ===== SELECT ELEMENTS ===== */
const messageInput = document.querySelector(".message-input");
const chatbody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");

const chatbot = document.getElementById("chatbot");
const openBtn = document.getElementById("open-chatbot");
const closeBtn = document.getElementById("close-chatbot");

/* ===== API CONFIG ===== */
const API_URL = "/.netlify/functions/chat";

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
      },
      body: JSON.stringify({
        message: userData.message,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "API Error");

    messageElement.innerText = data.reply?.trim() || "No response from assistant.";
  } catch (error) {
    console.error(error);
    messageElement.innerText = "Error: " + error.message;
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
