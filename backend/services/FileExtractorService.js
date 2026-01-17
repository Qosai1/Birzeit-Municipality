import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import pdfParse from "pdf-parse-fixed";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import os from "os";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * FileExtractorService
 * Handles text extraction from various file formats
 */
class FileExtractorService {
  /**
   * Extract images from PDF and OCR them
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} OCR text from images
   */
  static async extractImagesFromPDF(filePath) {
    try {
      // Try to use pdf-image-extractor if available
      try {
        // Dynamic import to check if pdf-image-extractor is available
        const pdfImageExtractor = await import("pdf-image-extractor").catch(
          () => null
        );

        if (pdfImageExtractor) {
          const tempDir = path.join(os.tmpdir(), `pdf-images-${Date.now()}`);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          let allImageText = "";

          // Extract images from PDF
          const { ExtractImages } = pdfImageExtractor;
          const images = await ExtractImages(filePath);

          // OCR each extracted image
          for (let i = 0; i < images.length; i++) {
            try {
              const imagePath = path.join(tempDir, `image-${i}.png`);
              fs.writeFileSync(imagePath, images[i]);

              // OCR the image
              const { data } = await Tesseract.recognize(imagePath, "ara+eng");
              const ocrText = data.text?.trim();

              // Clean up temp file
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }

              if (ocrText && ocrText.length > 0) {
                allImageText += ocrText + "\n";
              }
            } catch (imgErr) {
              console.warn(`Error OCRing PDF image ${i}:`, imgErr.message);
            }
          }

          // Clean up temp directory
          try {
            if (fs.existsSync(tempDir)) {
              const files = fs.readdirSync(tempDir);
              files.forEach((file) => {
                const filePath = path.join(tempDir, file);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              });
              fs.rmdirSync(tempDir);
            }
          } catch (cleanupErr) {
            console.warn(
              "Error cleaning up temp directory:",
              cleanupErr.message
            );
          }

          return allImageText;
        }
      } catch (importErr) {
        // pdf-image-extractor not installed
        console.warn(
          "PDF image extraction requires 'pdf-image-extractor' package. Install with: npm install pdf-image-extractor"
        );
      }

      // Fallback: return empty string if pdf-image-extractor is not available
      return "";
    } catch (err) {
      console.error("PDF image extraction error:", err);
      return "";
    }
  }

  // PDF extraction with embedded image OCR
  static async extractPDF(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const pdf = await pdfParse(buffer);
      let text = pdf.text || "";

      // Try to extract and OCR images from PDF
      // Note: pdf-parse doesn't extract images directly
      // For full image extraction, consider using pdf-image-extractor
      try {
        const imageText = await this.extractImagesFromPDF(filePath);
        if (imageText) {
          text += "\n\n[Text from embedded images]\n" + imageText;
        }
      } catch (imgErr) {
        console.warn("Could not extract images from PDF:", imgErr.message);
      }

      return text || "PDF contains no text.";
    } catch (err) {
      console.error("PDF extraction error:", err);
      throw new Error("Error reading PDF file");
    }
  }

  /**
   * Extract images from Word document and OCR them
   * @param {string} filePath - Path to Word file
   * @returns {Promise<string>} OCR text from embedded images
   */
  static async extractImagesFromWord(filePath) {
    try {
      const tempDir = path.join(os.tmpdir(), `word-images-${Date.now()}`);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      let allImageText = "";
      let imageIndex = 0;

      // Extract images using mammoth's convertToHtml with image handler
      await mammoth.convertToHtml(
        { path: filePath },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              // Get image buffer
              const imageBuffer = await image.read();

              // Determine file extension from content type
              let ext = ".png";
              if (
                image.contentType === "image/jpeg" ||
                image.contentType === "image/jpg"
              ) {
                ext = ".jpg";
              } else if (image.contentType === "image/gif") {
                ext = ".gif";
              } else if (image.contentType === "image/bmp") {
                ext = ".bmp";
              }

              // Save image temporarily
              const imagePath = path.join(
                tempDir,
                `image-${imageIndex++}${ext}`
              );
              fs.writeFileSync(imagePath, imageBuffer);

              // OCR the image
              const { data } = await Tesseract.recognize(imagePath, "ara+eng");
              const ocrText = data.text?.trim();

              // Clean up temp file
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }

              if (ocrText && ocrText.length > 0) {
                allImageText += ocrText + "\n";
              }

              // Return a data URI for the HTML (mammoth expects this)
              return {
                src: `data:${image.contentType};base64,${imageBuffer.toString(
                  "base64"
                )}`,
              };
            } catch (err) {
              console.warn("Error OCRing image from Word:", err.message);
              return { src: "" };
            }
          }),
        }
      );

      // Clean up temp directory
      try {
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);
          files.forEach((file) => {
            const filePath = path.join(tempDir, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
          fs.rmdirSync(tempDir);
        }
      } catch (cleanupErr) {
        console.warn("Error cleaning up temp directory:", cleanupErr.message);
      }

      return allImageText;
    } catch (error) {
      console.error("Word image extraction error:", error);
      return "";
    }
  }

  // Word extraction with embedded image OCR
  static async extractWord(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      let text = result.value || "";

      // Extract and OCR images from Word document
      try {
        const imageText = await this.extractImagesFromWord(filePath);
        if (imageText && imageText.trim().length > 0) {
          text += "\n\n[Text from embedded images]\n" + imageText.trim();
        }
      } catch (imgErr) {
        console.warn(
          "Could not extract images from Word document:",
          imgErr.message
        );
      }

      return text || "Word file empty";
    } catch (error) {
      console.error("Word extraction error:", error);
      throw new Error("Error reading Word file");
    }
  }

  // image extraction OCR
  static async extractImage(filePath) {
    try {
      const { data } = await Tesseract.recognize(filePath, "ara+eng");
      return data.text || "No text found in image";
    } catch (error) {
      console.error("Image extraction error:", error);
      throw new Error("Error reading image");
    }
  }

  // txt extraction
  static async extractTXT(filePath) {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error("TXT extraction error:", error);
      throw new Error("Error reading TXT");
    }
  }

  // json extraction
  static async extractJSON(filePath) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("JSON extraction error:", error);
      throw new Error("Error reading JSON");
    }
  }

  // csv extraction
  static async extractCSV(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const records = parse(content, { columns: true });
      return JSON.stringify(records, null, 2);
    } catch (error) {
      console.error("CSV extraction error:", error);
      throw new Error("Error reading CSV");
    }
  }

  /**
   * Extract images from Excel file and OCR them
   * Note: XLSX library doesn't support image extraction well
   * This is a placeholder for future enhancement
   * @param {string} filePath - Path to Excel file
   * @returns {Promise<string>} OCR text from embedded images
   */
  static async extractImagesFromXLSX(filePath) {
    try {
      // XLSX library doesn't extract images directly
      // For full image extraction from Excel, you'd need exceljs or similar
      // For now, return empty string
      return "";
    } catch (err) {
      console.error("Excel image extraction error:", err);
      return "";
    }
  }

  // xlsx extraction with embedded image OCR (placeholder)
  static async extractXLSX(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      let text = JSON.stringify(data, null, 2);

      // Note: Excel image extraction requires exceljs or similar library
      // XLSX doesn't support image extraction
      try {
        const imageText = await this.extractImagesFromXLSX(filePath);
        if (imageText) {
          text += "\n\n[Text from embedded images]\n" + imageText;
        }
      } catch (imgErr) {
        // Silently fail - Excel image extraction not fully supported
      }

      return text;
    } catch (error) {
      console.error("XLSX extraction error:", error);
      throw new Error("Error reading XLSX");
    }
  }

  /**
   * Extract text from file based on extension
   * @param {string} filePath - Path to the file
   * @param {string} filename - Original filename with extension
   * @returns {Promise<string>} Extracted text content
   */
  static async extractFile(filePath, filename) {
    const ext = path.extname(filename).toLowerCase();

    if (ext === ".pdf") return await this.extractPDF(filePath);
    if (ext === ".doc" || ext === ".docx")
      return await this.extractWord(filePath);
    if ([".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff"].includes(ext))
      return await this.extractImage(filePath);
    if (ext === ".txt") return this.extractTXT(filePath);
    if (ext === ".json") return this.extractJSON(filePath);
    if (ext === ".csv") return this.extractCSV(filePath);
    if (ext === ".xlsx" || ext === ".xls") return this.extractXLSX(filePath);

    return "Unsupported file type";
  }
}

export default FileExtractorService;
