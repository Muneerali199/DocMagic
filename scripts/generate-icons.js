/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import sharp from "sharp";

async function generate() {
  try {
    const svgPath = path.resolve("public/logo-icon.svg");
    const svgBuffer = fs.readFileSync(svgPath);
    console.log("Generating PNG assets from SVG...");

    // 1. Generate favicon-16x16.png
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile("public/favicon-16x16.png");
    console.log("Generated favicon-16x16.png");

    // 2. Generate favicon-32x32.png
    const png32Buffer = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

    fs.writeFileSync("public/favicon-32x32.png", png32Buffer);
    console.log("Generated favicon-32x32.png");

    // 3. Generate apple-touch-icon.png (180x180)
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile("public/apple-touch-icon.png");
    console.log("Generated apple-touch-icon.png");

    // 4. Generate favicon.ico using the 32x32 PNG buffer
    // An ICO file format header for 1 image:
    // Header (6 bytes):
    //   - Reserved: 2 bytes (0x0000)
    //   - Type: 2 bytes (1 for ICO, 0x0001)
    //   - Image Count: 2 bytes (1, 0x0001)
    // Directory Entry (16 bytes):
    //   - Width: 1 byte (32)
    //   - Height: 1 byte (32)
    //   - Color count: 1 byte (0 for >= 256 colors)
    //   - Reserved: 1 byte (0)
    //   - Color planes: 2 bytes (1)
    //   - Bits per pixel: 2 bytes (32)
    //   - Size of image data: 4 bytes (little endian integer of png32Buffer.length)
    //   - Offset of image data: 4 bytes (little endian integer, which is 6 + 16 = 22)
    const header = Buffer.alloc(22);
    // Header
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type = 1 (ICO)
    header.writeUInt16LE(1, 4); // Image count = 1

    // Directory entry
    header.writeUInt8(32, 6); // Width
    header.writeUInt8(32, 7); // Height
    header.writeUInt8(0, 8); // Color count
    header.writeUInt8(0, 9); // Reserved
    header.writeUInt16LE(1, 10); // Color planes
    header.writeUInt16LE(32, 12); // Bits per pixel
    header.writeUInt32LE(png32Buffer.length, 14); // Size of image data
    header.writeUInt32LE(22, 18); // Offset of image data

    const icoBuffer = Buffer.concat([header, png32Buffer]);
    fs.writeFileSync("public/favicon.ico", icoBuffer);
    console.log("Generated favicon.ico successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generate();
