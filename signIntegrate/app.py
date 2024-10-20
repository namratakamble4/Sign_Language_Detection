import cv2
import numpy as np
import tensorflow as tf
import math
from cvzone.HandTrackingModule import HandDetector
from flask import Flask, render_template, request, jsonify
from gtts import gTTS
import os
import time

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = tf.keras.models.load_model('gesture_model.h5')

# Initialize the hand detector
detector = HandDetector(maxHands=1)

# Constants
offset = 20
imgSize = 300
labels = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"]
detected_string = ""
cooldown_time = 2  # Minimum delay between detected letters
last_detected_time = time.time()

# Route for the homepage
@app.route('/')
def index():
    return render_template('index.html')

# API to detect gesture from uploaded image
@app.route('/detect', methods=['POST'])
def detect():
    global detected_string, last_detected_time

    # Get the image from the request
    file = request.files['image']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

    # Detect hand using cvzone
    hands, img = detector.findHands(img)
    if hands:
        hand = hands[0]
        x, y, w, h = hand['bbox']

        # Define cropping boundaries
        y1 = max(0, y - offset)
        y2 = min(img.shape[0], y + h + offset)
        x1 = max(0, x - offset)
        x2 = min(img.shape[1], x + w + offset)

        # Prepare image for model input
        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
        imgCrop = img[y1:y2, x1:x2]

        aspectRatio = h / w
        if aspectRatio > 1:
            # If height is greater than width, resize by height
            k = imgSize / h
            wCal = math.ceil(k * w)
            imgResize = cv2.resize(imgCrop, (wCal, imgSize))
            wGap = math.ceil((imgSize - wCal) / 2)
            imgWhite[:, wGap:wCal + wGap] = imgResize
        else:
            # If width is greater than height, resize by width
            k = imgSize / w
            hCal = math.ceil(k * h)
            imgResize = cv2.resize(imgCrop, (imgSize, hCal))
            hGap = math.ceil((imgSize - hCal) / 2)
            imgWhite[hGap:hCal + hGap, :] = imgResize

        # Normalize and expand dimensions for model input
        imgWhite = imgWhite / 255.0
        imgWhite = np.expand_dims(imgWhite, axis=0)

        # Make predictions using the model
        predictions = model.predict(imgWhite)
        classIndex = np.argmax(predictions)
        confidence = predictions[0][classIndex]
        detected_letter = labels[classIndex]

        # Add detected letter to the string if confidence is above 0.7 and cooldown time has passed
        if confidence > 0.7 and (time.time() - last_detected_time) > cooldown_time:
            detected_string += detected_letter
            last_detected_time = time.time()

        return jsonify({'letter': detected_letter, 'confidence': float(confidence), 'string': detected_string})

    return jsonify({'error': 'No hand detected'})

# API to convert detected string to speech
@app.route('/speak', methods=['POST'])
def speak():
    data = request.get_json()
    text = data.get('text', '')

    if text:
        try:
            # Synthesize the speech from the detected string
            tts = gTTS(text)
            audio_file_path = "static/speech.mp3"
            tts.save(audio_file_path)

            return jsonify({'success': True, 'audio_url': '/' + audio_file_path})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
    else:
        return jsonify({'success': False, 'message': 'No text to convert to speech'})

# Reset detected string API
@app.route('/reset', methods=['POST'])
def reset():
    global detected_string
    detected_string = ""
    return jsonify({'success': True, 'message': 'Detected string reset'})


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
