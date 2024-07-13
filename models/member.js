module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    penaltyUntil: {
      type: DataTypes.DATE,
      defaultValue: null
    }
  });

  Member.associate = (models) => {
    Member.hasMany(models.BorrowedBook, { as: 'borrowedBooks' });
  };

  return Member;
};
