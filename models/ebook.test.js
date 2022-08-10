const Sequelize = require('sequelize');
const Ebook = require('./ebook');
const config = require('../config/config')['test'];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe('Ebook 모델', () => {
    test('static init 메서드 호츨', () => {
        expect(Ebook.init(sequelize)).toBe(Ebook);
    });
    test('static associate 메서드 호출', () => {
        const db = {
            Ebook: {
                // hasMany: jest.fn(),
                belongsToMany: jest.fn(),
            },
        };
        Ebook.associate(db);
        expect(db.Ebook.belongsToMany).toHaveBeenCalledTimes(1);
    });
});