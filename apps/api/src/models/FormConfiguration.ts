import mongoose from 'mongoose';

const answerOptionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    nextQuestionId: {
      type: String,
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    text: {
      type: String,
      required: true,
    },
    fieldType: {
      type: String,
      enum: ['text', 'select'],
      required: true,
    },
    answerOptions: [answerOptionSchema],
  },
  { _id: false }
);

const formConfigurationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export default mongoose.model('FormConfiguration', formConfigurationSchema);
