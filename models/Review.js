const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    required: [true, "Please add a rating between 1 & 10"],
    min: 1,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  }
});

// below unique is not working
// Prevent User from submitting more than one review per bootcamp
ReviewSchema.index({bootcamp: 1, user:1}, {unique:true})


// static method to get average ratings and save (it will be called directly on the model)
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
      {
        $match: { bootcamp: bootcampId }, //match bootcamp having the bootcampId
      },
      {
        $group: {
          _id: "$bootcamp", //bootcampId
          averageRating: { $avg: "$rating" }, //$avg is average operator , $tuition means we want average of tuition
        },
      },
    ]);
  
    try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
          averageRating: obj[0].averageRating
      })
    } catch (error) {
      console.error(error)
    }
  };
  
  // Call getAverageRating after save
  ReviewSchema.post("save", function () {
      this.constructor.getAverageRating(this.bootcamp);
  });
  // Call getAverageRating before remove
  ReviewSchema.pre("remove", function () {
      this.constructor.getAverageRating(this.bootcamp);
  });

module.exports = mongoose.model("Review", ReviewSchema);
