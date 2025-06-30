import psycopg2
from flask import Flask, request, jsonify
import face_recognition
import numpy as np
# Flask, request, and jsonify from the flask package are used to create the web server, handle incoming requests, and send JSON responses.
# face_recognition is used for encoding faces, and numpy is used for handling numerical data.

app = Flask(__name__)
# app = Flask(__name__) creates a new Flask web application instance.
# This instance will handle incoming requests and route them to the appropriate functions.

# Connect to PostgreSQL (adjust credentials as needed)
conn = psycopg2.connect(
    host="localhost",
    user= "postgres",
    password= "Ravi12345",
    database="postgres",
    options="-c search_path=public"
)
cursor = conn.cursor()
print("📡 Connected to DB:", conn.get_dsn_parameters())

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
    
    try:
        file.stream.seek(0)
        # Use file.stream to pass the raw file bytes
        image = face_recognition.load_image_file(file.stream)
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    encodings = face_recognition.face_encodings(image)
    # Detects any faces in the image and computes their face encodings.
    # Face encodings are numerical vectors representing unique features of each detected face.
    # encodings will be a list of encoding vectors (one per detected face).
    if len(encodings) > 0:
        return jsonify({'encoding': encodings[0].tolist()}) # .tolist() converts the numpy array encoding to a regular Python list so it can be serialized as JSON.
    return jsonify({'error': 'No face found'}), 400
    # If no faces were detected in the image, returns a JSON error message with HTTP status 400 Bad Request.

@app.route('/decode', methods=['POST'])
def decode():
    print("==== /decode endpoint hit ====")
    print("request.files:", request.files)
    print("request.form:", request.form)

    if 'image' not in request.files or 'className' not in request.form:
        return jsonify({'error': 'Missing image or class name'}), 400

    file = request.files['image']
    class_name = request.form['className']

    try:
        file.stream.seek(0)
        # Before loading the image, you reset the file pointer to the beginning (position 0).
        image = face_recognition.load_image_file(file.stream)
        unknown_encodings = face_recognition.face_encodings(image)
    except Exception as e:
        print("❌ Face encoding error:", str(e))
        return jsonify({'error': f'Invalid image or encoding issue: {str(e)}'}), 400

    if len(unknown_encodings) == 0:
        return jsonify({'error': 'No faces found in the image'}), 400

    try:
        # 🔐 Reset any failed transaction state from earlier
        conn.rollback()
        cursor.execute("""
            SELECT students.id, face_encoding
            FROM students
            JOIN classes ON students.class_id = classes.id
            WHERE classes.class_name = %s
        """, (class_name,))
        student_rows = cursor.fetchall()
    except Exception as e:
        print("❌ Database error:", str(e))
        conn.rollback()  # ⛑️ Reset even after SELECT error
        return jsonify({'error': f'Database query failed: {str(e)}'}), 500

    known_encodings = []
    student_ids = []

    for sid, encoding_blob in student_rows:
        if encoding_blob is None:
            print(f"⚠️ Skipping student {sid}: encoding is NULL")
            continue
        try:
            arr = np.frombuffer(encoding_blob, dtype=np.float64)
            # Converts the binary encoding from the database into a numpy array.
            known_encodings.append(arr)
            student_ids.append(sid)
        except Exception as e:
            print(f"❌ Failed to decode student {sid}:", str(e))

    present_ids = set()
    for unknown in unknown_encodings:
        matches = face_recognition.compare_faces(known_encodings, unknown, tolerance=0.45)
        for idx, match in enumerate(matches):
            if match:
                present_ids.add(student_ids[idx])

    print("✅ Matched student IDs:", present_ids)
    return jsonify({"present_ids": list(present_ids)})

    # Sends back a JSON list of student IDs who were matched and are present in the classroom image.
    # 🧠 In Your Case (Classroom Photos): 
    # Many faces, possibly low quality, slight angle differences
    # Use tolerance = 0.45 or 0.5 for: Fewer false positives (don’t mark the wrong student as present) Still tolerant of natural variations
    
if __name__ == '__main__':
    app.run(port=6001)
