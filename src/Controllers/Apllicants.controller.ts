import type { Request, Response } from "express";
import { PDFParse } from "pdf-parse";

class ApplicantScreeningController {
	static async parseApplicantScreeningPdf(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const requestWithFile = req as Request & {
				file?: Express.Multer.File | undefined;
			};

			if (!requestWithFile.file) {
				res.status(400).json({ message: "PDF file is required" });
				return;
			}

			const parser = new PDFParse({ data: requestWithFile.file.buffer });
			const parsed = await parser.getText();
			await parser.destroy();

			const extractedText = parsed.text?.trim() ?? "";

			if (!extractedText) {
				res.status(422).json({ message: "No readable text found in PDF" });
				return;
			}

			res.status(200).json({
				message: "Applicant screening completed",
				screening: {
					fileName: requestWithFile.file.originalname,
					pages: parsed.pages?.length ?? 0,
					extractedText,
				},
			});
		} catch (error) {
			res.status(500).json({
				message: "Failed to parse PDF for applicant screening",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}

export default ApplicantScreeningController;
