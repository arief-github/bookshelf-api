const { nanoid } = require('nanoid');
const books = require('./Books');


// handler POST , path: /books
const addBooksHandler = (request, h) => {
    const id = nanoid(16);
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    // checking if user not inserting book name. return error 400
    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);

        return response;
    }

    // checking if user input readPage > pageCount. return error 400
    if (pageCount < readPage) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);

        return response;
    }

    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = (pageCount === readPage);
    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
    };

    books.push(newBook);


    // success condition. return success message 201
    const addBookSuccess = books.filter((book) => book.id === id).length > 0;

    if (addBookSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};



// handler GET , path: /books
const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    let filteredBooks = books;

    // check condition if name is exist
    if (name) {
        filteredBooks = filteredBooks.filter((book) => book
            .name.toLowerCase().includes(name.toLowerCase()));
    }

    // check condition if reading false / true
    if (reading) {
        filteredBooks = filteredBooks.filter((book) => book.reading === !!Number(reading));
    }

    // check condition if finished false/true
    if (finished) {
        filteredBooks = filteredBooks.filter((book) => book.finished === !!Number(finished));
    }


    //  generic error. return error 500
    const response = h.response({
        status: 'success',
        data: {
            books: filteredBooks.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
        },
    }).code(200);
    return response;
};



// handler GET, path: books/id
const getBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const book = books.filter(b => b.id === id)[0];

    if (book) {
        return {
            status: 'success',
            data: {
                book,
            }
        }
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan'
    }).code(404);


    return response;
}

// handler PUT, path books/{bookId}
const editBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    const updatedAt = new Date().toISOString();

    // check if user not input the book names. status code 400
    const checkPropertyName = request.payload.hasOwnProperty('name');

    if (!checkPropertyName) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        }).code(400);
        return response;
    }

    // check if user input readPage > pageCount. status code 400
    const checkPage = readPage <= pageCount;

    if (!checkPage) {
        const response = h.response({
            status: 'fail',
            message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
        }).code(400);
        return response;
    }

    // success condition. status code 200
    const index = books.findIndex(book => book.id === id);
    const finished = (pageCount === readPage);
    if (index !== -1) {
        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            finished,
            updatedAt,
        };

        const response = h.response({
            status: 'success',
            message: "Buku berhasil diperbarui"
        }).code(200);
        return response;
    }

    // id not found. statusCode 404
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan'
    }).code(404);
    return response;
}

// handler DELETE, path /books/{bookId}
const deleteBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const index = books.findIndex(book => book.id === id);

    // if id found , book deleted. status 200
    if (index !== -1) {
        books.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus'
        }).code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: "Buku gagal dihapus. Id tidak ditemukan"
    }).code(404);
    return response;
}

module.exports = { addBooksHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler }