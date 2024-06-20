const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  id: {  type: String, unique: true},
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  sold: Boolean,
  category: String,
});

module.exports = mongoose.model('Transaction', TransactionSchema);
