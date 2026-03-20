import { NextRequest, NextResponse } from "next/server";

// pdf2json and jszip are CommonJS modules in this environment.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFParser = require("pdf2json");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require("jszip");

type PdfTextRun = {
  T: string;
};

type PdfText = {
  x: number;
  y: number;
  R?: PdfTextRun[];
};

type PdfPage = {
  Texts?: PdfText[];
};

type PdfData = {
  Pages?: PdfPage[];
};

type SheetRow = string[];

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const ROW_TOLERANCE = 0.75;
const COLUMN_TOLERANCE = 1.5;
const EXCEL_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function decodePdfText(value: string): string {
  try {
    return decodeURIComponent(value).replace(/\+/g, " ");
  } catch {
    return value;
  }
}

function extractTextItemValue(text: PdfText): string {
  return (text.R ?? [])
    .map((run) => decodePdfText(run.T ?? ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeWorksheetName(name: string, index: number): string {
  const cleaned = name.replace(/[\\/*?:[\]]/g, " ").trim();
  return (cleaned || `Page ${index + 1}`).slice(0, 31);
}

function getColumnLetter(columnNumber: number): string {
  let n = columnNumber;
  let result = "";

  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }

  return result;
}

function toCellReference(row: number, column: number): string {
  return `${getColumnLetter(column)}${row}`;
}

function clusterPositions(values: number[], tolerance: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const clusters: number[] = [];

  for (const value of sorted) {
    const last = clusters[clusters.length - 1];
    if (last === undefined || Math.abs(value - last) > tolerance) {
      clusters.push(value);
      continue;
    }

    clusters[clusters.length - 1] = (last + value) / 2;
  }

  return clusters;
}

function closestColumnIndex(columns: number[], x: number): number {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  columns.forEach((columnX, index) => {
    const distance = Math.abs(columnX - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function rowsToWorksheetXml(rows: SheetRow[]): string {
  const safeRows = rows.length > 0 ? rows : [["No readable rows found"]];
  const maxColumns = Math.max(...safeRows.map((row) => row.length), 1);
  const dimension = `A1:${toCellReference(safeRows.length, maxColumns)}`;

  const rowXml = safeRows
    .map((row, rowIndex) => {
      const cellXml = row
        .map((value, columnIndex) => {
          const ref = toCellReference(rowIndex + 1, columnIndex + 1);
          const sanitized = value.trim();

          if (sanitized === "") {
            return `<c r="${ref}" t="inlineStr"><is><t></t></is></c>`;
          }

          const numericCandidate = sanitized.replace(/,/g, "");
          const isNumeric = /^-?\d+(\.\d+)?$/.test(numericCandidate);
          if (isNumeric) {
            return `<c r="${ref}"><v>${numericCandidate}</v></c>`;
          }

          const safeValue = /^[=+\-@]/.test(sanitized) ? `'${sanitized}` : sanitized;
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
            safeValue
          )}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowIndex + 1}">${cellXml}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetViews>
    <sheetView workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function buildWorkbookXml(sheetNames: string[]): string {
  const sheets = sheetNames
    .map(
      (name, index) =>
        `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${
          index + 1
        }"/>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheets}</sheets>
</workbook>`;
}

function buildWorkbookRelsXml(sheetCount: number): string {
  const relationships = Array.from({ length: sheetCount }, (_, index) => {
    return `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
      index + 1
    }.xml"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${relationships}
  <Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function buildRootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function buildContentTypesXml(sheetCount: number): string {
  const worksheetOverrides = Array.from({ length: sheetCount }, (_, index) => {
    return `<Override PartName="/xl/worksheets/sheet${
      index + 1
    }.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${worksheetOverrides}
</Types>`;
}

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border>
      <left/>
      <right/>
      <top/>
      <bottom/>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

function pageToRows(page: PdfPage, pageIndex: number): SheetRow[] {
  const items = (page.Texts ?? [])
    .map((text) => ({
      x: text.x,
      y: text.y,
      value: extractTextItemValue(text),
    }))
    .filter((item) => item.value.length > 0)
    .sort((a, b) => (Math.abs(a.y - b.y) <= ROW_TOLERANCE ? a.x - b.x : a.y - b.y));

  if (items.length === 0) {
    return [[`No readable text found on page ${pageIndex + 1}`]];
  }

  const rowGroups: { y: number; items: typeof items }[] = [];

  items.forEach((item) => {
    const existingRow = rowGroups.find((row) => Math.abs(row.y - item.y) <= ROW_TOLERANCE);
    if (existingRow) {
      existingRow.items.push(item);
      existingRow.y = (existingRow.y + item.y) / 2;
      return;
    }

    rowGroups.push({ y: item.y, items: [item] });
  });

  const columnPositions = clusterPositions(
    rowGroups.flatMap((row) => row.items.map((item) => item.x)),
    COLUMN_TOLERANCE
  );

  return rowGroups.map((row) => {
    const cells = Array.from({ length: Math.max(columnPositions.length, 1) }, () => "");

    row.items
      .sort((a, b) => a.x - b.x)
      .forEach((item) => {
        const columnIndex =
          columnPositions.length > 0 ? closestColumnIndex(columnPositions, item.x) : 0;
        cells[columnIndex] = cells[columnIndex]
          ? `${cells[columnIndex]} ${item.value}`
          : item.value;
      });

    let lastNonEmpty = cells.length - 1;
    while (lastNonEmpty >= 0 && cells[lastNonEmpty] === "") {
      lastNonEmpty -= 1;
    }

    return cells.slice(0, Math.max(lastNonEmpty + 1, 1));
  });
}

async function extractPdfData(buffer: Buffer): Promise<PdfData> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData: { parserError?: Error } | Error) => {
      const parserError =
        errData instanceof Error ? errData : errData.parserError ?? new Error("PDF parsing failed");
      reject(parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: PdfData) => {
      resolve(pdfData);
    });

    pdfParser.parseBuffer(buffer);
  });
}

async function buildXlsxBuffer(pdfData: PdfData): Promise<Buffer> {
  const pages = pdfData.Pages ?? [];
  if (pages.length === 0) {
    throw new Error("No pages were found in this PDF.");
  }

  const zip = new JSZip();
  const sheetNames = pages.map((_, index) => sanitizeWorksheetName(`Page ${index + 1}`, index));

  zip.file("[Content_Types].xml", buildContentTypesXml(sheetNames.length));
  zip.folder("_rels")?.file(".rels", buildRootRelsXml());
  zip.folder("xl")?.file("workbook.xml", buildWorkbookXml(sheetNames));
  zip.folder("xl")?.folder("_rels")?.file("workbook.xml.rels", buildWorkbookRelsXml(sheetNames.length));
  zip.folder("xl")?.file("styles.xml", buildStylesXml());

  const worksheetsFolder = zip.folder("xl")?.folder("worksheets");
  pages.forEach((page, index) => {
    worksheetsFolder?.file(`sheet${index + 1}.xml`, rowsToWorksheetXml(pageToRows(page, index)));
  });

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await extractPdfData(buffer);
    const hasReadableText = (pdfData.Pages ?? []).some(
      (page) => (page.Texts ?? []).some((text) => extractTextItemValue(text).length > 0)
    );

    if (!hasReadableText) {
      return NextResponse.json(
        {
          error: "No readable text found in this PDF. It may be a scanned image.",
        },
        { status: 422 }
      );
    }

    const workbookBuffer = await buildXlsxBuffer(pdfData);
    const originalName = file.name.replace(/\.pdf$/i, "");
    const outputFilename = `${originalName}_converted.xlsx`;

    return new NextResponse(new Uint8Array(workbookBuffer), {
      status: 200,
      headers: {
        "Content-Type": EXCEL_CONTENT_TYPE,
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[pdf-to-excel] Route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
