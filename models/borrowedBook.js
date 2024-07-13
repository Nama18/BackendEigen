module.exports = (sequelize, DataTypes) => {
  const BorrowedBook = sequelize.define('BorrowedBook', {
    borrowedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    returned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  BorrowedBook.associate = (models) => {
    BorrowedBook.belongsTo(models.Member, {
      foreignKey: 'memberId',
      onDelete: 'CASCADE'
    });
    BorrowedBook.belongsTo(models.Book, {
      foreignKey: 'bookId',
      onDelete: 'CASCADE'
    });
  };

  return BorrowedBook;
};
