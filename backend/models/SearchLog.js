const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    resultsCount: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    source: {
        type: String,
        enum: ['web', 'mobile'],
        default: 'web',
    },
    sessionId: {
        type: String,
    },
    wasClicked: {
        type: Boolean,
        default: false,
    },
    productIdClicked: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    }
}, {
    timestamps: true,
});

// Index for fast analytics
searchLogSchema.index({ query: 1 });
searchLogSchema.index({ timestamp: -1 });
searchLogSchema.index({ resultsCount: 1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);
