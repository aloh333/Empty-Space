const Sequelize = require('sequelize');

module.exports = class Ebook extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            writer: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            publisher: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            field: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            img: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },
            price: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            description: {
                type: Sequelize.TEXT('tiny'), // TINYTEXT Type: String Maximum: 255 characters
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: 'Ebook',
            tableName: 'ebooks',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Ebook.belongsToMany(db.User, { through: 'Reader' });
    }
};