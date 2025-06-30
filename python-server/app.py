from flask import Flask, request, jsonify
import face_recognition
import numpy as np
# Flask, request, and jsonify from the flask package are used to create the web server, handle incoming requests, and send JSON responses.
# face_recognition is used for encoding faces, and numpy is used for handling numerical data.

app = Flask(__name__)
# app = Flask(__name__) creates a new Flask web application instance.
# This instance will handle incoming requests and route them to the appropriate functions.

@app.route('/')
def hello():
    return "Hello, World!"

@app.route('/encode', methods=['POST'])
# Defines a route /encode that accepts POST requests.
# When a POST request is sent to /encode, the encode() function will be called.

def encode():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['image']
    image = face_recognition.load_image_file(file) # Loads the image file into a format suitable for face recognition processing.
    encodings = face_recognition.face_encodings(image)
    # Detects any faces in the image and computes their face encodings.
    # Face encodings are numerical vectors representing unique features of each detected face.
    # encodings will be a list of encoding vectors (one per detected face).
    if len(encodings) > 0:
        return jsonify({'encoding': encodings[0].tolist()}) # .tolist() converts the numpy array encoding to a regular Python list so it can be serialized as JSON.
    return jsonify({'error': 'No face found'}), 400
    # If no faces were detected in the image, returns a JSON error message with HTTP status 400 Bad Request.

if __name__ == '__main__':
    app.run(port=6001)
