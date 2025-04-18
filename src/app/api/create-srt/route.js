import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'pzwl-captionator';

export async function POST(request) {
  try {
    const { captions, filename } = await request.json();
    
    if (!captions || !Array.isArray(captions) || captions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty captions array' },
        { status: 400 }
      );
    }
    
    // Format captions as SRT
    let srtContent = '';
    captions.forEach((caption, index) => {
      // Format start and end time as HH:MM:SS,mmm
      const formatSrtTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const secs = String(date.getUTCSeconds()).padStart(2, '0');
        const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
        return `${hours}:${minutes}:${secs},${ms}`;
      };
      
      const startTime = formatSrtTime(caption.start);
      const endTime = formatSrtTime(caption.end);
      
      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${caption.text.trim()}\n\n`;
    });
    
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      await fsPromises.mkdir(tmpDir, { recursive: true });
    }
    
    // Generate unique SRT filename based on original filename
    const baseFilename = path.basename(filename, path.extname(filename));
    const srtFilename = `${baseFilename}-${Date.now()}.srt`;
    const srtPath = path.join(tmpDir, srtFilename);
    
    // Write SRT file locally
    await fsPromises.writeFile(srtPath, srtContent, 'utf8');
    
    // Read the file and upload it to S3
    const srtData = await fsPromises.readFile(srtPath);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: srtFilename,
        Body: srtData,
        ContentType: 'text/plain'
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      srtFilename,
      message: 'SRT file created and uploaded successfully' 
    });
  } catch (error) {
    console.error('Error creating SRT file:', error);
    return NextResponse.json(
      { error: 'Failed to create SRT file' },
      { status: 500 }
    );
  }
}