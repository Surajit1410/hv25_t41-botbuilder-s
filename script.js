const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API setup
const API_KEY = "AIzaSyC5LNz5DF7PqJds7-mEuE2QGxwemmgaT5k";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

// Initialize user message and file data
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

// Store chat history
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// Knowledge Base (Custom Q&A)
const knowledgeBase = [
  { question: "What is your name", answer: "I am your  interactive, user-friendly, and capable of understanding natural language queries chatbot, 'ECHOBOT' !" },
  {
    question: "What is your use",
    answer: "Siliguri Institute of Technology (SIT) aims to enhance its official website (www.sittechno.org or www.sittechno.edu.in) by integrating an AI-based chatbot. This chatbot will act as a virtual assistant to help users get quick and accurate responses to their queries. "
  },
  {
    question: "What is your purpose",
    answer: "I can answer your questions and assist you."
  },
  {
    question: "What can you help with",
    answer: "I am  designed to assist three main types of users: \n1. Prospective Students (seeking admission-related information).  \n2. Current Students (looking for academic or institutional information).  \n3. Alumni (requesting documents or other support).  "
  },
  {
    question: "What are the key features that you can implement",
    answer: "1. Provide information about courses offered, eligibility criteria, admission process, fees, and important dates.  \n2. Answer FAQs related to admissions. "
  },
  {
    question: "Do you know siliguri institute of technology", answer: "Yes, I'm familiar with Siliguri Institute of Technology (SIT). It is a private engineering college located in Siliguri, West Bengal, India. Established in 1999, SIT is affiliated with Maulana Abul Kalam Azad University of Technology (MAKAUT), formerly known as WBUT (West Bengal University of Technology)."
  },
  {
    question: "What are the courses offered by SIT", answer: "SIT offers undergraduate (B.Tech) programs in various engineering disciplines such as Computer Science, Civil Engineering, Electronics, and Electrical Engineering, among others. The college is known for its focus on quality education, infrastructure, and extra-curricular activities that help students in their overall development."
  },
  {
    question: "What are the facilities provided by sit", answer: "It has a decent campus with hostels, libraries, and other amenities for students. The college also organizes various events and technical festivals, which allow students to showcase their skills and interact with industry professionals."
  },
  {
    question: "Tell me a joke.", answer: "Why don't skeletons fight each other? They don't have the guts!"
  },
  {
    question: "do you know the procedure about the procedures and courses offered by sit", answer: "I can certainly provide an overview of the procedures and courses typically offered at Siliguri Institute of Technology (SIT). However, for the most accurate and up-to-date details, especially regarding admissions, eligibility, or course specifics, it's always best to visit the official website or contact the college directly."
  },
  {
    question: "provide details about the courses", answer: "Here's a general overview:\n1. Courses Offered: SIT primarily offers undergraduate (B.Tech) courses in various engineering disciplines. \nSome of the popular courses are:\n\nUndergraduate Programs (B.Tech): \n~Computer Science and Engineering (CSE)\nElectronics and Communication Engineering (ECE)\n~Electrical Engineering (EE)\n~Civil Engineering (CE)\nInformation Technology (IT).\n\nThese courses are designed to prepare students for both theoretical and practical aspects of their respective fields."
  },
  {
    question: "Explain the admission procedure for btech", answer: "Admission Procedure:For B.Tech:\n\nEligibility Criteria: \nCandidates should have passed 10+2with Physics, Chemistry, and Mathematics as the mainsubjects, and a minimum aggregate percentage (usually45% to 50%) depending on the course.\n\nEntrance Exam: \nAdmission is based on WBJEE (West BengalJoint Entrance Examination) or JEE Main scores. Studentscan also apply through the Management Quota, but thiswould involve direct admission.\n\nApplication Process: Students need to apply through theofficial SIT portal after qualifying the entrance examsThere may be a separate online application process formanagement quota admissions."},
  {
    question: "Explain the admission procedure for mtech", answer: "For M.Tech:\n\nEligibility Criteria: \nCandidates should have a B.Tech equivalent degree in the relevant field from recognized university.\n\nEntrance Exam: Admission to M.Tech courses typicallrequires a valid score in the GATE exam. Some seats maalso be available through other state-level exams omanagement quota.\n\nApplication Process: The application is usuallavailable online, and candidates need to submit theidetails and required documents."
  },
  {
    question: "Tell me a joke.", answer: "Why don't skeletons fight each other? They don't have the guts!"
  },
  
];

// Create message element with dynamic classes
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Generate bot response using API or Knowledge Base
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  const matchedAnswer = knowledgeBase.find(entry =>
    userData.message.toLowerCase().includes(entry.question.toLowerCase())
  );

  if (matchedAnswer) {
    messageElement.innerText = matchedAnswer.answer;
    chatHistory.push({ role: "model", parts: [{ text: matchedAnswer.answer }] });
  } else {
    chatHistory.push({
      role: "user",
      parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],
    });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\\(.?)\\*/g, "$1").trim();
      messageElement.innerText = apiResponseText;
      chatHistory.push({ role: "model", parts: [{ text: apiResponseText }] });
    } catch (error) {
      console.error(error);
      messageElement.innerText = "Error: " + error.message;
      messageElement.style.color = "#ff0000";
    }
  }

  userData.file = {};
  incomingMessageDiv.classList.remove("thinking");
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
};

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  if (!userData.message) return;

  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");

  const messageContent = `<div class="message-text">${userData.message}</div>
                          ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    const botMessageContent = `<div class="message-text">
      <div class="thinking-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>`;

    const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius =
    messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && messageInput.value.trim() && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// Handle file input change
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    userData.file = { data: base64String, mime_type: file.type };
  };

  reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Initialize emoji picker on page load
document.addEventListener("DOMContentLoaded", () => {
  const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
      const { selectionStart: start, selectionEnd: end } = messageInput;
      messageInput.setRangeText(emoji.native, start, end, "end");
      messageInput.focus();
    },
    onClickOutside: (e) => {
      if (e.target.id === "emoji-picker") {
        document.body.classList.toggle("show-emoji-picker");
      } else {
        document.body.classList.remove("show-emoji-picker");
      }
    },
  });

  document.querySelector(".chat-form").appendChild(picker);
});

// Event listeners for buttons
sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));