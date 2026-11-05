import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { prisma } from "../src/lib/prisma";
import { uniqueSlug, uniqueSku } from "../src/services/product.service";
import { slugify } from "../src/lib/format";

async function parseXLSX(filePath: string): Promise<Array<Record<string, string>>> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet("Products") || workbook.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    headers[colNumber] = val;
  });

  const results: Array<Record<string, string>> = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    let hasValue = false;
    const rowObj: Record<string, string> = {};
    headers.forEach((hdr, colNumber) => {
      if (!hdr) return;
      const cell = row.getCell(colNumber);
      let strVal = "";
      if (cell.value !== null && cell.value !== undefined) {
        if (typeof cell.value === "object" && "text" in (cell.value as any)) {
          strVal = String((cell.value as any).text).trim();
        } else if (cell.value instanceof Date) {
          strVal = cell.value.toISOString().slice(0, 10);
        } else {
          strVal = String(cell.value).trim();
        }
      }
      if (strVal) hasValue = true;
      rowObj[hdr] = strVal;
    });
    if (hasValue && (rowObj.name || rowObj.productname)) {
      results.push(rowObj);
    }
  }
  return results;
}

// Simple robust CSV parser handling quotes and commas
function parseCSV(content: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      if (currentLine.trim().length > 0) {
        lines.push(currentLine);
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let cur = "";
    let inQ = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      const nc = line[j + 1];
      if (c === '"') {
        if (inQ && nc === '"') {
          cur += '"';
          j++;
        } else {
          inQ = !inQ;
        }
      } else if (c === "," && !inQ) {
        values.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    values.push(cur.trim());
    return values;
  };

  const headers = parseRow(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  const results: Array<Record<string, string>> = [];
  for (let k = 1; k < lines.length; k++) {
    const rowValues = parseRow(lines[k]);
    if (rowValues.length === 0 || (rowValues.length === 1 && !rowValues[0])) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((hdr, idx) => {
      rowObj[hdr] = rowValues[idx] || "";
    });
    results.push(rowObj);
  }

  return results;
}

async function main() {
  const customTarget = process.argv[2];
  let filePath = "";

  if (customTarget && fs.existsSync(customTarget)) {
    filePath = path.resolve(customTarget);
  } else {
    const candidates = [
      path.resolve(process.cwd(), "products_template.xlsx"),
      path.resolve(process.cwd(), "../products_template.xlsx"),
      path.resolve(process.cwd(), "products_template.csv"),
      path.resolve(process.cwd(), "../products_template.csv"),
    ];
    filePath = candidates.find((p) => fs.existsSync(p)) || "";
  }

  if (!filePath) {
    console.error("❌ No products_template.xlsx or products_template.csv found!");
    process.exit(1);
  }

  console.log(`📄 Reading products from: ${filePath}`);
  const isXLSX = filePath.toLowerCase().endsWith(".xlsx");
  const rows = isXLSX
    ? await parseXLSX(filePath)
    : parseCSV(fs.readFileSync(filePath, "utf-8"));

  if (rows.length === 0) {
    console.log("ℹ️ The sheet only contains the header row. No products were found to import.");
    console.log("👉 Add your product rows below the header row, save the file, and re-run: npm run import:products");
    return;
  }

  console.log(`Found ${rows.length} product row(s) to import...`);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row.name || row.productname;
    if (!name) {
      console.warn("⚠️ Skipping row without product name:", row);
      skipped++;
      continue;
    }

    const catName = row.category || row.categoryname || "General";
    const catSlug = slugify(catName);

    // Find or create category
    let category = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: catName, slug: catSlug },
      });
      console.log(`+ Created new category: "${catName}"`);
    }

    const unit = row.unit || "1 pc";
    const price = parseFloat(row.price || "0") || 0;
    const mrp = parseFloat(row.mrp || "0") || price;
    const purchasePrice = parseFloat(row.purchaseprice || "0") || 0;
    const stock = parseInt(row.stock || "0", 10) || 0;
    const brand = row.brand || null;
    const description = row.description || null;
    const image = row.image || row.imageurl || null;
    const supplier = row.supplier || null;
    const batch = row.batch || null;
    const expiryDate = row.expirydate && !isNaN(new Date(row.expirydate).getTime())
      ? new Date(row.expirydate)
      : null;
    const featured = row.featured?.toLowerCase() === "true" || row.featured === "1";
    const bestSeller = row.bestseller?.toLowerCase() === "true" || row.bestseller === "1";
    const active = row.active?.toLowerCase() !== "false" && row.active !== "0";

    const slug = await uniqueSlug(name);
    const sku = await uniqueSku(name);

    await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        categoryId: category.id,
        brand,
        unit,
        mrp,
        price,
        purchasePrice,
        stock,
        image,
        description,
        supplier,
        batch,
        expiryDate,
        featured,
        bestSeller,
        active,
      },
    });

    imported++;
    console.log(`✔ Imported: "${name}" (${unit}) - Rs. ${price} [Stock: ${stock}, Cat: ${catName}]`);
  }

  console.log("\n==========================================");
  console.log(`🎉 Import finished! Successfully imported ${imported} product(s). Skipped: ${skipped}`);
  console.log("==========================================");
}

main()
  .catch((err) => {
    console.error("❌ Import error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
