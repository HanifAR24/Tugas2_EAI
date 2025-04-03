const apiBaseUrl = "http://localhost:5000"; // Ganti dengan URL API back-end jika berbeda

// Function untuk mengambil dan menampilkan semua buku
async function getBooks() {
    try {
        const response = await fetch(`${apiBaseUrl}/books`);
        const data = await response.json();
        console.log("GET /books", data);
        // Asumsikan data yang diterima adalah array
        displayBooks(data);
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}


// Function untuk menampilkan daftar buku pada kontainer
function displayBooks(books) {
    const container = document.getElementById("booksContainer");
    container.innerHTML = "";
    books.forEach(book => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("p-2", "border", "rounded", "mb-2");
        bookDiv.innerHTML = `
            <p><strong>Judul:</strong> ${book.title}</p>
            <p><strong>Penulis:</strong> ${book.author}</p>
            <p><strong>Tahun Terbit:</strong> ${book.year}</p>
            <button onclick="editBook(${book.id})" class="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Edit</button>
            <button onclick="deleteBook(${book.id})" class="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
        `;
        container.appendChild(bookDiv);
    });
}


// Function untuk menambahkan buku baru
async function addBook() {
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const published = document.getElementById("published").value.trim();

    if (!title || !author || !published) {
        alert("Semua field harus diisi!");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/books`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, author, year: published })
        });
        const data = await response.json();
        console.log("Response POST /books:", data);
        // Panggil getBooks() untuk refresh tampilan
        getBooks();
    } catch (error) {
        console.error("Error adding book:", error);
    }
}


// Function untuk memperbarui buku
async function updateBook(id, updatedData) {
    try {
        const response = await fetch(`${apiBaseUrl}/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });
        const data = await response.json();
        console.log("PUT /books/" + id, data);
        // Refresh list setelah update
        getBooks();
    } catch (error) {
        console.error("Error updating book:", error);
    }
}

// Function untuk menghapus buku
async function deleteBook(id) {
    if (!confirm("Apakah kamu yakin ingin menghapus buku ini?")) return;
    try {
        const response = await fetch(`${apiBaseUrl}/books/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();
        console.log("DELETE /books/" + id, data);
        // Refresh list setelah penghapusan
        getBooks();
    } catch (error) {
        console.error("Error deleting book:", error);
    }
}

// Function untuk mengedit buku menggunakan prompt (metode sederhana)
function editBook(id) {
    const newTitle = prompt("Masukkan judul baru:");
    const newAuthor = prompt("Masukkan penulis baru:");
    const newPublished = prompt("Masukkan tahun terbit baru:");

    if (newTitle && newAuthor && newPublished) {
        updateBook(id, { title: newTitle, author: newAuthor, published: newPublished });
    } else {
        alert("Edit dibatalkan karena data tidak lengkap.");
    }
}

// Event listener untuk tombol "Tambah Buku"
document.getElementById("addBookBtn").addEventListener("click", addBook);

// Saat halaman dimuat, ambil daftar buku
window.onload = function() {
    getBooks();
};
