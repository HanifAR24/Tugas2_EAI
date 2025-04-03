from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Mengizinkan akses dari front-end di domain berbeda

# Konfigurasi database SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inisialisasi database dan Marshmallow
db = SQLAlchemy(app)
ma = Marshmallow(app)

# Model Book
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)

    def __init__(self, title, author, year):
        self.title = title
        self.author = author
        self.year = year

# Schema untuk serialisasi Book
class BookSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Book

book_schema = BookSchema()
books_schema = BookSchema(many=True)

# Endpoint untuk memastikan API berjalan
@app.route('/')
def home():
    return jsonify({"message": "API is running!"})

# Endpoint GET: Mengambil semua buku
@app.route('/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return books_schema.jsonify(books), 200

# Endpoint GET: Mengambil satu buku berdasarkan ID
@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get(book_id)
    if book is None:
        return jsonify({"error": "Book not found"}), 404
    return book_schema.jsonify(book), 200

# Endpoint POST: Menambahkan buku baru
@app.route('/books', methods=['POST'])
def add_book():
    data = request.get_json()
    # Pastikan semua field yang dibutuhkan ada
    if not data or not all(k in data for k in ("title", "author", "year")):
        return jsonify({"error": "Missing data. Required fields: title, author, year"}), 400

    new_book = Book(title=data['title'], author=data['author'], year=data['year'])
    db.session.add(new_book)
    db.session.commit()
    return book_schema.jsonify(new_book), 201

# Endpoint PUT: Memperbarui data buku berdasarkan ID
@app.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    book = Book.query.get(book_id)
    if book is None:
        return jsonify({"error": "Book not found"}), 404

    data = request.get_json()
    book.title = data.get("title", book.title)
    book.author = data.get("author", book.author)
    book.year = data.get("year", book.year)
    db.session.commit()
    return book_schema.jsonify(book), 200

# Endpoint DELETE: Menghapus buku berdasarkan ID
@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if book is None:
        return jsonify({"error": "Book not found"}), 404

    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book deleted successfully"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Membuat tabel jika belum ada
    app.run(debug=True)
