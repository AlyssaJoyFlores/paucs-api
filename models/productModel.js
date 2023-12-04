const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    ctgy_selection: {
        type: String,
    },
    ctgy_stocks: {
        type: Number
    }
}, {_id: false})


const productSchema = new mongoose.Schema({
    prod_department: {
        type: String,
        enum: ['CITE', 'CMA', 'CCJE', 'CAS', 'SHS', 'PHINMA AU SOUTH'],
        default: 'PHINMA AU SOUTH'
    },
    prod_status: {
        type: String,
        enum: ['NEW', 'OLD', 'SOLD OUT']
    },
    image: {
        type: String,
    },
    prod_name: {
        type: String,
        required: true
    },
    prod_desc: {
        type: String,
        required: true
    },
    prod_price: {
        type: Number,
        required: true
    },
    categories: [categorySchema],
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {timestamps: true})





module.exports = mongoose.model('Product', productSchema);
