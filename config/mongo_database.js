var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB);
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;


var	userSchema = new Schema({
	username: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	name: { type: String, required: true },
	dateCreated: { type: Date, default: Date.now }
});

var linkSchema = new Schema({
  url: { type: String, required: true },
  _owner: { type: Schema.ObjectId, ref: 'user', required: true },
  read: Boolean,
  dateCreated: { type: Date, default: Date.now }
});


// Bcrypt middleware on UserSchema
userSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
  });
});

//Password verification
userSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(isMatch);
    });
};


var User = mongoose.model('user', userSchema);
var Link = mongoose.model('link', linkSchema);

// Export Models
exports.User = User;
exports.Link = Link;
