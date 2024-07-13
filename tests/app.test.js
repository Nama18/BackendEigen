const request = require('supertest');
const app = require('../app');
const { sequelize, Book, Member, BorrowedBook } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  await Book.bulkCreate([
    { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 },
    { code: 'SHR-1', title: 'A Study in Scarlet', author: 'Arthur Conan Doyle', stock: 1 },
    { code: 'TW-11', title: 'Twilight', author: 'Stephenie Meyer', stock: 1 },
    { code: 'HOB-83', title: 'The Hobbit, or There and Back Again', author: 'J.R.R. Tolkien', stock: 1 },
    { code: 'NRN-7', title: 'The Lion, the Witch and the Wardrobe', author: 'C.S. Lewis', stock: 1 },
  ]);

  await Member.bulkCreate([
    { code: 'M001', name: 'Angga' },
    { code: 'M002', name: 'Ferry' },
    { code: 'M003', name: 'Putri' },
  ]);
});

afterAll(async () => {
  await sequelize.close();
});

describe('Library Management System', () => {
  it('should get all books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(5);
  });

  it('should get all members', async () => {
    const res = await request(app).get('/api/members');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(3);
  });

  it('should borrow a book', async () => {
    const res = await request(app).post('/api/members/1/borrow').send({ code: 'JK-45' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Book borrowed successfully');

    const book = await Book.findByPk(1);
    expect(book.stock).toEqual(0);

    const borrowedBooks = await BorrowedBook.findAll({ where: { memberId: 1, bookId: 1, returned: false } });
    expect(borrowedBooks).toHaveLength(1);
  });

  it('should return a book', async () => {
    const res = await request(app).post('/api/members/1/return').send({ bookId: 1 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Book returned successfully');

    const book = await Book.findByPk(1);
    expect(book.stock).toEqual(1);

    const borrowedBooks = await BorrowedBook.findAll({ where: { memberId: 1, bookId: 1, returned: true } });
    expect(borrowedBooks).toHaveLength(1);
  });
});
