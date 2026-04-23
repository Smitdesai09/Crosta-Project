const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address.",
      },
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false, // Mongoose NOT to include that field when fetching data by default
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpire: {
      type: Date
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("User", userSchema);
