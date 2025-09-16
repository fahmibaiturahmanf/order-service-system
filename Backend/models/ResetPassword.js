const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResetPasswordSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 3600000, // 1 jam
    index: { expires: 0 }, // TTL index
  },
});

module.exports = mongoose.model('ResetPassword', ResetPasswordSchema);
