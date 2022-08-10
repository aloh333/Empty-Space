const mongoose = require('mongoose');

const database = {};

const connect = (app, config) => {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db_url, {
        useNewUrlParser: true, 
        useFindAndModify: false, 
        useUnifiedTopology: true, 
        useCreateIndex: true  // 몽구스 버전 6.0 이상 부터는 필요없다.
    }, (error) => {
        if (error) {
            console.log('몽고디비 연결 에러', error);
        } else {
            console.log('몽고디비 연결 성공');
        }
    });

    database = mongoose.connection;

    database.on('open', () => {
        console.log('데이터베이스에 연결되었습니다. : ' + config.db_url);
        createSchema(app, config);
    });

    database.on('disconnected', () => {
        console.error('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connectDB, 5000);
    });

    database.on('error', (error) => {
        console.error('몽고디비 연결 에러', error);
    });

}

database.init = (app, config) => {
    connect(app, config);
};

const defineSchema = (curItem) => {
    const curSchema = require(curItem.file).createSchema(mongoose);

    const curModel = mongoose.model(curItem.collection, curSchema);

    database[curItem.schemaName] = curSchema;
    database[curItem.modelName] = curModel;
}

const createSchema = (app, config) => {
    const curItem = config.db_schemas[0];
    const curItem2 = config.db_schemas[1];
    const curItem3 = config.db_schemas[2];

    defineSchema(curItem);
    defineSchema(curItem2);
    defineSchema(curItem3);

    app.set('database', database);
}

module.exports = database;

/*
const mongoose = require('mongoose');

const connect = () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }
    mongoose.connect(config.db_url, {
        dbName: 'shop',
    }, (error) => {
        if (error) {
            console.log('몽고디비 연결 에러', error);
        } else {
            console.log('몽고디비 연결 성공');
        }
    });
};

mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
});
mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
    connect();
});

module.exports = connect;
*/