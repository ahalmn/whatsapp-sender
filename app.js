// ======================================================
// CONFIGURATION
// ======================================================

// Put your deployed Cloudflare Worker URL here.
//
// Example:
// https://whatsapp-sender.your-name.workers.dev

const WORKER_URL =
  "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev";


// ======================================================
// ELEMENTS
// ======================================================

const form = document.getElementById("messageForm");

const phoneInput =
  document.getElementById("phone");

const messageInput =
  document.getElementById("message");

const counter =
  document.getElementById("counter");

const sendButton =
  document.getElementById("sendButton");

const buttonText =
  document.getElementById("buttonText");

const spinner =
  document.getElementById("spinner");

const statusBox =
  document.getElementById("status");


// ======================================================
// MESSAGE COUNTER
// ======================================================

messageInput.addEventListener("input", () => {

  counter.textContent =
    messageInput.value.length;

});


// ======================================================
// STATUS
// ======================================================

function showStatus(message, type) {

  statusBox.textContent = message;

  statusBox.className =
    "status " + type;

}

function hideStatus() {

  statusBox.className =
    "status hidden";

  statusBox.textContent = "";

}


// ======================================================
// BUTTON STATE
// ======================================================

function setLoading(loading) {

  sendButton.disabled = loading;

  if (loading) {

    buttonText.textContent =
      "Sending...";

    spinner.classList.remove("hidden");

  } else {

    buttonText.textContent =
      "Send WhatsApp Message";

    spinner.classList.add("hidden");

  }

}


// ======================================================
// PHONE NORMALIZATION
// ======================================================

function normalizePhone(phone) {

  // Remove spaces, -, (, ), and other characters.
  let cleaned =
    phone.replace(/[^\d+]/g, "");

  // Convert 00 international prefix to +
  if (cleaned.startsWith("00")) {

    cleaned =
      "+" + cleaned.substring(2);

  }

  // Remove + for WhatsApp API.
  if (cleaned.startsWith("+")) {

    cleaned =
      cleaned.substring(1);

  }

  return cleaned;

}


// ======================================================
// FORM SUBMISSION
// ======================================================

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  hideStatus();

  const phone =
    normalizePhone(phoneInput.value.trim());

  const message =
    messageInput.value.trim();


  // ----------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------

  if (!phone) {

    showStatus(
      "Please enter a WhatsApp number.",
      "error"
    );

    phoneInput.focus();

    return;

  }


  if (!/^\d{8,15}$/.test(phone)) {

    showStatus(
      "Please enter a valid international phone number.",
      "error"
    );

    phoneInput.focus();

    return;

  }


  if (!message) {

    showStatus(
      "Please enter a message.",
      "error"
    );

    messageInput.focus();

    return;

  }


  if (message.length > 4096) {

    showStatus(
      "Message is too long.",
      "error"
    );

    return;

  }


  if (
    !WORKER_URL ||
    WORKER_URL.includes("YOUR-WORKER")
  ) {

    showStatus(
      "Please configure the Cloudflare Worker URL in app.js.",
      "error"
    );

    return;

  }


  // ----------------------------------------------------
  // SEND
  // ----------------------------------------------------

  setLoading(true);

  try {

    const response =
      await fetch(WORKER_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          phone: phone,
          message: message
        })

      });


    let data;

    try {

      data =
        await response.json();

    } catch {

      data = {};

    }


    if (!response.ok) {

      const errorMessage =
        data.error ||
        data.message ||
        "The server could not send the message.";

      throw new Error(errorMessage);

    }


    showStatus(
      "Message request accepted successfully.",
      "success"
    );


    // Clear message after successful request.
    messageInput.value = "";

    counter.textContent = "0";


  } catch (error) {

    console.error(error);

    showStatus(
      error.message ||
      "Something went wrong while sending the message.",
      "error"
    );

  } finally {

    setLoading(false);

  }

});
