const express = require('express');
const router = express.Router();
const { Member, Book, BorrowedBook } = require('../models');

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.findAll({ include: 'borrowedBooks' });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Borrow a book
router.post('/:id/borrow', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (member.penaltyUntil && member.penaltyUntil > new Date()) {
      return res.status(400).json({ message: 'Member is penalized' });
    }

    const borrowedBooksCount = await BorrowedBook.count({
      where: { memberId: member.id, returned: false }
    });

    if (borrowedBooksCount >= 2) {
      return res.status(400).json({ message: 'Member cannot borrow more than 2 books' });
    }

    const book = await Book.findOne({ where: { code: req.body.bookId } });
    if (!book || book.stock < 1) return res.status(400).json({ message: 'Book not available' });

    await book.decrement('stock');

    await BorrowedBook.create({
      memberId: member.id,
      bookId: book.id
    });

    res.status(200).json({ message: 'Book borrowed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Return a book
router.post('/:id/return', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const borrowedBook = await BorrowedBook.findOne({
      where: { memberId: member.id, bookId: req.body.bookId, returned: false }
    });

    if (!borrowedBook) return res.status(400).json({ message: 'Book not borrowed by member' });

    borrowedBook.returned = true;
    await borrowedBook.save();

    await Book.increment('stock', { where: { id: req.body.bookId } });

    const borrowDuration = (new Date() - new Date(borrowedBook.borrowedDate)) / (1000 * 60 * 60 * 24);
    if (borrowDuration > 7) {
      member.penaltyUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await member.save();
    }

    res.status(200).json({ message: 'Book returned successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
