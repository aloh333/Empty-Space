const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema3 = {};

Schema3.createSchema = (mongoose) => {
    const ProductSchema = mongoose.Schema({
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
    });

    ProductSchema.static('findAll', (callback) => {
        return this.find({ }, callback);
    });

    return ProductSchema;
}

module.exports = Schema3;