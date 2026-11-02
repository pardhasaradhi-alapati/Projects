
from flask import Flask, request, jsonify, send_file, send_from_directory
from io import BytesIO
import qrcode
import re

app = Flask(__name__)


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def website_files(filename):
    return send_from_directory(".", filename)


@app.route("/api/generate", methods=["POST"])
def generate_qr():

    # Receive JSON from JavaScript
    data = request.get_json(silent=True) or {}

    text = str(data.get("text", "")).strip()
    size = data.get("size", 250)
    qr_color = data.get("qr_color", "#000000")
    bg_color = data.get("bg_color", "#ffffff")

    # Validate input
    if not text:
        return jsonify({"error": "Please enter text or URL"}), 400

    try:
        size = int(size)

        if size not in [200, 250, 300, 400]:
            raise ValueError()

        if not re.fullmatch(r"#[0-9a-fA-F]{6}", qr_color):
            raise ValueError()

        if not re.fullmatch(r"#[0-9a-fA-F]{6}", bg_color):
            raise ValueError()

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid size or color"}), 400

    try:
        # Generate QR code
        qr = qrcode.QRCode(
            version=None,
            box_size=10,
            border=4
        )

        qr.add_data(text)
        qr.make(fit=True)

        image = qr.make_image(
            fill_color=qr_color,
            back_color=bg_color
        ).convert("RGB")

        # Resize image
        image = image.resize((size, size))

        # Save image in memory
        image_buffer = BytesIO()
        image.save(image_buffer, format="PNG")
        image_buffer.seek(0)

        # Send image to frontend
        return send_file(
            image_buffer,
            mimetype="image/png",
            download_name="qrcode.png"
        )

    except Exception:
        app.logger.exception("QR generation failed")
        return jsonify({"error": "QR generation failed"}), 500


if __name__ == "__main__":
    app.run(debug=True)
