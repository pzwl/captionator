import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

// Dynamically import ffmpeg-static
import ffmpegStatic from 'ffmpeg-static';
const ffmpegPath = ffmpegStatic;

console.log("FFmpeg binary path:", ffmpegPath);
if (!fs.existsSync(ffmpegPath)) {
  console.error("FFmpeg binary not found at:", ffmpegPath);
  throw new Error("FFmpeg binary not found");
}

ffmpeg.setFfmpegPath(ffmpegPath);

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
    const { videoFile, srtFile } = await request.json();
    
    if (!videoFile || !srtFile) {
      return NextResponse.json({ error: 'Video file and SRT file are required' }, { status: 400 });
    }

    // Create a unique ID for the processed video
    const processedVideoFileName = `captioned-${uuidv4()}-${videoFile}`;
    const tempDir = path.join(process.cwd(), 'tmp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const localVideoPath = path.join(tempDir, videoFile);
    const localSrtPath = path.join(tempDir, srtFile);
    const localOutputPath = path.join(tempDir, processedVideoFileName);
    
    // Download the original video from S3
    const videoParams = {
      Bucket: BUCKET_NAME,
      Key: videoFile
    };
    
    const videoCommand = new GetObjectCommand(videoParams);
    const videoResponse = await s3Client.send(videoCommand);
    
    // Write video file locally
    const videoStream = videoResponse.Body;
    if (!(videoStream instanceof Readable)) {
      throw new Error('Video response body is not a readable stream');
    }
    
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(localVideoPath);
      videoStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Download the SRT file from S3
    const srtParams = {
      Bucket: BUCKET_NAME,
      Key: srtFile
    };
    
    const srtCommand = new GetObjectCommand(srtParams);
    const srtResponse = await s3Client.send(srtCommand);
    
    // Write SRT file locally
    const srtStream = srtResponse.Body;
    if (!(srtStream instanceof Readable)) {
      throw new Error('SRT response body is not a readable stream');
    }
    
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(localSrtPath);
      srtStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Process the video with FFmpeg to embed captions
    await new Promise((resolve, reject) => {
      ffmpeg(localVideoPath)
        .outputOptions([
          '-vf', `subtitles=${localSrtPath}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,BorderStyle=3,Outline=1,Shadow=1,MarginV=25'`,
          '-c:a', 'copy'
        ])
        .output(localOutputPath)
        .on('end', () => {
          console.log('Processing finished successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during processing', err);
          reject(new Error(`FFmpeg processing error: ${err.message}`));
        })
        .run();
    });
    
    // Upload processed video to S3
    const fileStream = fs.createReadStream(localOutputPath);
    const fileBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      fileStream.on('data', (chunk) => chunks.push(chunk));
      fileStream.on('error', reject);
      fileStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: processedVideoFileName,
      Body: fileBuffer,
      ContentType: 'video/mp4'
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Generate a signed URL for the processed video
    const signedUrlParams = {
      Bucket: BUCKET_NAME,
      Key: processedVideoFileName
    };
    
    const signedUrlCommand = new GetObjectCommand(signedUrlParams);
    const signedUrl = await getSignedUrl(s3Client, signedUrlCommand, { expiresIn: 604800 }); // 1 week expiration
    
    // Clean up temporary files
    try {
      fs.unlinkSync(localVideoPath);
      fs.unlinkSync(localSrtPath);
      fs.unlinkSync(localOutputPath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }
    
    return NextResponse.json({
      success: true,
      processedVideoUrl: signedUrl,
      fileName: processedVideoFileName
    });
    
  } catch (error) {
    console.error('Error processing video:', error);
    return NextResponse.json({ error: error.message || 'Failed to process video' }, { status: 500 });
  }
}