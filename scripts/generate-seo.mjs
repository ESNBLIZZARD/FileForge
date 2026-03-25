import fs from 'fs';
import path from 'path';

export const tools = [
  // PDF Conversions
  { id: "pdf-to-word", name: "PDF to Word", description: "Convert PDF files to editable Word documents with perfect formatting.", category: "pdf" },
  { id: "pdf-to-excel", name: "PDF to Excel", description: "Extract tables and data from PDF into structured Excel spreadsheets.", category: "pdf" },
  { id: "pdf-to-ppt", name: "PDF to PowerPoint", description: "Convert PDF presentations back to editable PowerPoint slides.", category: "pdf" },
  { id: "pdf-to-image", name: "PDF to Image", description: "Convert each PDF page to high-quality PNG or JPG images.", category: "pdf" },
  { id: "word-to-pdf", name: "Word to PDF", description: "Convert Word documents to PDF with perfect layout preservation.", category: "pdf" },
  { id: "excel-to-pdf", name: "Excel to PDF", description: "Convert Excel spreadsheets to PDF for easy sharing.", category: "pdf" },
  { id: "ppt-to-pdf", name: "PowerPoint to PDF", description: "Convert PowerPoint presentations to PDF instantly.", category: "pdf" },
  { id: "html-to-pdf", name: "HTML to PDF", description: "Convert any HTML page or file to a professional PDF document.", category: "pdf" },
  { id: "markdown-to-pdf", name: "Markdown to PDF", description: "Render Markdown files as beautiful, formatted PDF documents.", category: "pdf" },
  { id: "pdf-merge", name: "Merge PDF", description: "Combine multiple PDF files into one document in seconds.", category: "pdf-utilities" },
  { id: "pdf-split", name: "Split PDF", description: "Split a PDF into multiple files or extract specific pages.", category: "pdf-utilities" },
  { id: "pdf-compress", name: "Compress PDF", description: "Reduce PDF file size while maintaining quality.", category: "pdf-utilities" },
  { id: "pdf-watermark", name: "Watermark PDF", description: "Add custom text or image watermarks to PDF pages.", category: "pdf-utilities" },
  { id: "pdf-protect", name: "Protect PDF", description: "Password protect your PDF files with strong encryption.", category: "pdf-utilities" },
  { id: "pdf-unlock", name: "Unlock PDF", description: "Remove password protection from PDF files.", category: "pdf-utilities" },
  { id: "pdf-ocr", name: "OCR PDF", description: "Extract searchable text from scanned PDFs using OCR technology.", category: "pdf-utilities" },
  { id: "pdf-rearrange", name: "Rearrange PDF", description: "Drag and drop PDF pages to reorder, delete, or rotate them.", category: "pdf-utilities" },
  { id: "image-jpg-to-png", name: "JPG to PNG", description: "Convert JPG images to PNG format with transparency support.", category: "image-utilities" },
  { id: "image-png-to-jpg", name: "PNG to JPG", description: "Convert PNG images to JPG format quickly.", category: "image-utilities" },
  { id: "image-jpg-to-webp", name: "JPG to WebP", description: "Convert JPG to modern WebP format for better compression.", category: "image-utilities" },
  { id: "image-png-to-webp", name: "PNG to WebP", description: "Convert PNG to WebP for optimal web performance.", category: "image-utilities" },
  { id: "image-svg-to-png", name: "SVG to PNG", description: "Convert SVG vector graphics to raster PNG images.", category: "image-utilities" },
  { id: "image-heic-to-jpg", name: "HEIC to JPG", description: "Convert iPhone HEIC photos to compatible JPG format.", category: "image-utilities" },
  { id: "image-compress", name: "Compress Image", description: "Reduce image file size with smart compression algorithms.", category: "image-utilities" },
  { id: "image-resize", name: "Resize Image", description: "Change image dimensions while preserving aspect ratio.", category: "image-utilities" },
  { id: "image-crop", name: "Crop & Rotate", description: "Crop and rotate images with a precision editor.", category: "image-utilities" },
  { id: "mp3-to-wav", name: "MP3 to WAV", description: "Convert MP3 audio to lossless WAV format.", category: "audio" },
  { id: "wav-to-mp3", name: "WAV to MP3", description: "Compress WAV audio files to smaller MP3 format.", category: "audio" },
  { id: "mp3-to-aac", name: "MP3 to AAC", description: "Convert MP3 to AAC for better quality at smaller file sizes.", category: "audio" },
  { id: "wav-to-flac", name: "WAV to FLAC", description: "Convert WAV to lossless FLAC for audiophile-grade audio.", category: "audio" },
  { id: "audio-compress", name: "Audio Bitrate Reducer", description: "Reduce audio bitrate to shrink file size for streaming.", category: "audio" },
  { id: "mp4-to-mkv", name: "MP4 to MKV", description: "Convert MP4 videos to MKV format with chapter support.", category: "video" },
  { id: "mp4-to-avi", name: "MP4 to AVI", description: "Convert MP4 to AVI for legacy device compatibility.", category: "video" },
  { id: "mov-to-mp4", name: "MOV to MP4", description: "Convert Apple MOV videos to universal MP4 format.", category: "video" },
  { id: "compress-video", name: "Compress Video", description: "Reduce video file size while keeping acceptable quality.", category: "video" },
  { id: "extract-audio", name: "Extract Audio", description: "Pull the audio track from any video file as MP3 or WAV.", category: "video" },
  { id: "csv-to-xlsx", name: "CSV to Excel", description: "Convert CSV files to formatted Excel spreadsheets.", category: "data" },
  { id: "xlsx-to-csv", name: "Excel to CSV", description: "Export Excel spreadsheets to universal CSV format.", category: "data" },
  { id: "json-to-csv", name: "JSON to CSV", description: "Flatten JSON data arrays into CSV format instantly.", category: "data" },
  { id: "csv-to-json", name: "CSV to JSON", description: "Convert CSV files to JSON for use in web applications.", category: "data" },
  { id: "xml-to-json", name: "XML to JSON", description: "Transform XML data structures into JSON format.", category: "data" },
  { id: "json-to-xml", name: "JSON to XML", description: "Convert JSON objects to XML for legacy system integration.", category: "data" },
  { id: "yaml-to-json", name: "YAML to JSON", description: "Convert YAML configuration files to JSON format.", category: "data" },
  { id: "json-to-yaml", name: "JSON to YAML", description: "Convert JSON data to human-readable YAML format.", category: "data" }
];

const targetDir = 'c:\\Users\\Priyanka\\Desktop\\util-app\\src\\app\\tools';

let count = 0;
for (const tool of tools) {
  // Wait, my tools IDs from lib/tools.ts don't always perfectly match the directories.
  // The directories are named compress-video, etc. Let's see if the directory exists using tool.id
  // with or without 'image-' prefix. Let's handle generic matching.
  
  // Actually, wait, some tool IDs have "image-", but the directories might not. 
  // Let's check both `tool.id` and `tool.id.replace('image-', '')`... No, let's just 
  // read all directories in `src/app/tools` and find a matching tool for each directory.
}

const dirList = fs.readdirSync(targetDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== '[tool]')
  .map(dirent => dirent.name);

for (const dir of dirList) {
  let matchedTool = tools.find(t => t.id === dir || t.id.replace(/^(image-|pdf-)/, '') === dir || t.name.toLowerCase().replace(/ /g, '-') === dir);
  
  // if no match, default to a generic tool object
  if (!matchedTool) {
    matchedTool = {
      name: dir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + " Tool",
      description: "Convert, edit, and optimize your files instantly right in your browser.",
      id: dir,
      category: "file"
    };
  }
  
  const layoutContent = `import { Metadata } from "next";

export const metadata: Metadata = {
  title: "${matchedTool.name} | Free Online File Converter | FileForge",
  description: "${matchedTool.description}",
  keywords: "${matchedTool.name.toLowerCase()}, free online ${matchedTool.name.toLowerCase()}, file converter, online tool",
  openGraph: {
    title: "${matchedTool.name} - Free Online Tool",
    description: "${matchedTool.description}",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;

  const layoutPath = path.join(targetDir, dir, 'layout.tsx');
  fs.writeFileSync(layoutPath, layoutContent);
  console.log(`Generated: ${layoutPath}`);
  count++;
}

console.log(`Generated metadata layouts for ${count} tool directories.`);
