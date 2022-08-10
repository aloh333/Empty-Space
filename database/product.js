// 판매자(회원) 상품 스키마
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema3 = {};

Schema3.createSchema = (mongoose) => {
    const ProductSchema = mongoose.Schema({  // 상품 정보
        productId: {
            type : Number, 
            unique: true
        },
        owner: {
            ownerId: {
                type: Number
            },
            ownerEmail: {
                type : String
            }
        },
        name: {
            type : String, 
            required : true, 
            unique : true, 
            'default' : ' '
        },
        image: {
            type : String
        },
        starScore: {
            type : String, 
            'default' : ' '
        },
        price: {
            type : String, 
            required : true, 
            'default' : ' '
        },
        discountPrice: {
            type : String, 
            'default' : ' '
        },
        description: {
            type : String, 
            'default' : '상품 정보가 없습니다.'
        },
        createdAt : {
            type : Date, 
            index : {
                unique : false
            }, 
            'default' : Date.now
        },
        updatedAt : 
        {
            type : Date, 
            index : {
                unique : false
            }, 
            'default' : Date.now
        }
    });

    ProductSchema.plugin(AutoIncrement, {
        inc_field: 'productId'
    });  // 상품 id를 1부터 1씩 증가시킴.

    ProductSchema.static('findAll', (callback) => {
        return this.find({ }, callback);
    });

    return ProductSchema;
}

module.exports = Schema3;

/*
const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const productSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    seller: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: Buffer,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    star: {
        type: Number,
    },
    description: {
        type: Number,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

productSchema.plugin(AutoIncrement, {
    inc_field: 'id'
});  // 상품 id를 1부터 1씩 증가시킴.

module.exports = mongoose.model('Product', productSchema);
*/