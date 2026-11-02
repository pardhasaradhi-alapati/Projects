
const form = document.getElementById("qrForm");

const textInput = document.getElementById("textInput");
const qrCodeContainer = document.getElementById("qrCodeContainer");

const qrSize = document.getElementById("qrSize");
const qrColor = document.getElementById("qrColor");
const bgColor = document.getElementById("bgColor");

const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");
const message = document.getElementById("message");

let generatedImageURL = null;


// 1. Generate QR Code using Flask API

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const text = textInput.value.trim();

    if (!text) {
        message.textContent = "Please enter text or URL.";
        return;
    }

    message.textContent = "Generating QR code...";
    downloadBtn.disabled = true;

    const data = {
        text: text,
        size: Number(qrSize.value),
        qr_color: qrColor.value,
        bg_color: bgColor.value
    };

    try {

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "QR generation failed.");
        }

        // Receive PNG image from Flask
        const imageBlob = await response.blob();

        // Create image URL
        generatedImageURL = URL.createObjectURL(imageBlob);

        // Display QR image
        qrCodeContainer.innerHTML = "";

        const image = document.createElement("img");

        image.src = generatedImageURL;
        image.alt = "Generated QR Code";
        image.style.maxWidth = "100%";
        image.style.height = "auto";

        qrCodeContainer.appendChild(image);

        downloadBtn.disabled = false;

        message.textContent = "QR code generated successfully!";

    } catch (error) {

        console.error("Error:", error);

        message.textContent = error.message;

        downloadBtn.disabled = true;
    }

});


// 2. Download QR Code

downloadBtn.addEventListener("click", function() {

    if (!generatedImageURL) {
        message.textContent = "Generate a QR code first.";
        return;
    }

    const link = document.createElement("a");

    link.href = generatedImageURL;
    link.download = "my-qrcode.png";

    link.click();

    message.textContent = "QR code downloaded successfully!";

});


// 3. Clear QR Code

clearBtn.addEventListener("click", function() {

    textInput.value = "";

    qrCodeContainer.innerHTML =
        "<p>Your QR code will appear here.</p>";

    if (generatedImageURL) {
        URL.revokeObjectURL(generatedImageURL);
        generatedImageURL = null;
    }

    downloadBtn.disabled = true;

    message.textContent = "QR code cleared.";

});
