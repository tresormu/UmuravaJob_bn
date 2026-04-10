import mongoose, { Schema, Document } from "mongoose";
// Schema
const JobSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    skills: {
        type: [String],
        required: true,
    },
    experience: {
        type: Number,
        required: true,
        min: 0,
    },
    education: {
        type: String,
        default: "Not specified",
    },
    location: {
        type: String,
        default: "Remote",
    },
    recruiterId: {
        type: Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true,
    },
}, {
    timestamps: true, // adds createdAt & updatedAt
});
// Model
export default mongoose.model("Job", JobSchema);
//# sourceMappingURL=Job.model.js.map