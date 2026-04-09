import Applicant from "../Models/Applicant.model.js";
class ApplicantsController {
    static async GetApplicants(req, res) {
        try {
            const applicants = await Applicant.find();
            res.status(200).json({ applicants });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch applicants" });
        }
    }
    static async GetApplicantById(req, res) {
        try {
            const { id } = req.params;
            const applicant = await Applicant.findById(id);
            if (!applicant) {
                res.status(404).json({ message: "Applicant not found" });
                return;
            }
            res.status(200).json({ applicant });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch applicant" });
        }
    }
    static async CreateApplicant(req, res) {
        try {
            const { jobId, recruiterId, fullName, email, phone, location, resumeUrl, resumeFileName, resumeText, linkedInUrl, portfolioUrl, structuredProfile, parsedData, normalized, status, source, sourceFileId, isParsed, parsedAt, recruiterNotes, tags, } = req.body;
            const existing = email ? await Applicant.findOne({ email }) : null;
            if (!jobId || !recruiterId || !fullName || !source) {
                res.status(400).json({
                    message: "jobId, recruiterId, fullName, and source are required",
                });
                return;
            }
            const applicant = await Applicant.create({
                jobId,
                recruiterId,
                fullName,
                email,
                phone,
                location,
                resumeUrl,
                resumeFileName,
                resumeText,
                linkedInUrl,
                portfolioUrl,
                structuredProfile,
                parsedData,
                normalized,
                status,
                source,
                sourceFileId,
                isDuplicate: Boolean(existing),
                isParsed,
                parsedAt,
                recruiterNotes,
                tags,
            });
            res.status(201).json({ applicant });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to create applicant" });
        }
    }
    static async UpdateApplicant(req, res) {
        try {
            const { id } = req.params;
            const updatedApplicant = await Applicant.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
            if (!updatedApplicant) {
                res.status(404).json({ message: "Applicant not found" });
                return;
            }
            res.status(200).json({ applicant: updatedApplicant });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update applicant" });
        }
    }
    static async DeleteApplicant(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Applicant.findByIdAndDelete(id);
            if (!deleted) {
                res.status(404).json({ message: "Applicant not found" });
                return;
            }
            res.status(200).json({ message: "Applicant deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to delete applicant" });
        }
    }
}
export default ApplicantsController;
//# sourceMappingURL=Applicants.controller.js.map