import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { execSync } from 'child_process';

// IMPORTANT: Set the direct path to ffmpeg executable
const FFMPEG_PATH = 'C:\\Users\\sharm\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-7.1.1-full_build\\bin\\ffmpeg.exe';

// Verify if ffmpeg exists at the specified path
if (fs.existsSync(FFMPEG_PATH)) {
  console.log('FFmpeg executable found at:', FFMPEG_PATH);
  ffmpeg.setFfmpegPath(FFMPEG_PATH);
} else {
  console.error('FFmpeg executable NOT found at:', FFMPEG_PATH);
}

// Test system ffmpeg
try {
  exec('ffmpeg -version', (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing system ffmpeg:', error);
      return;
    }
    console.log('System FFmpeg version info:', stdout.split('\n')[0]);
  });
} catch (e) {
  console.error('Failed to execute system ffmpeg test:', e);
}

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
  // Create a unique ID for this processing job
  const jobId = uuidv4();
  const tempDir = path.join(process.cwd(), 'tmp');
  let localVideoPath = null;
  let localSrtPath = null;
  let localOutputPath = null;
  
  try {
    const data = await request.json();
    const { videoFile, srtFile } = data;
    
    console.log('Processing request with files:', { videoFile, srtFile });
    
    if (!videoFile || !srtFile) {
      return NextResponse.json({ error: 'Video file and SRT file are required' }, { status: 400 });
    }

    // Create a unique filename for the processed video
    const processedVideoFileName = `captioned-${jobId}-${path.basename(videoFile)}`;
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    localVideoPath = path.join(tempDir, `${jobId}-video${path.extname(videoFile)}`);
    localSrtPath = path.join(tempDir, `${jobId}-subs.srt`);
    localOutputPath = path.join(tempDir, `${jobId}-output${path.extname(videoFile)}`);

    console.log('Local file paths:', { localVideoPath, localSrtPath, localOutputPath });

    // Download the original video from S3
    console.log('Downloading video from S3:', videoFile);
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
    console.log('Video downloaded successfully to:', localVideoPath);

    // Download the SRT file from S3
    console.log('Downloading SRT from S3:', srtFile);
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
    console.log('SRT downloaded successfully to:', localSrtPath);
    
    console.log('Using direct FFmpeg command execution');

    // FIXED APPROACH: Use subtitles filter directly with proper escaping
    try {
      console.log('Processing video with hardcoded subtitles');
      
      // Convert Windows backslashes to forward slashes for FFmpeg
      const srtPathForFfmpeg = localSrtPath.replace(/\\/g, '/');
      
      // The key fix - proper filter syntax:
      // 1. Use single quotes inside double quotes for Windows
      // 2. Escape the Windows path properly
      // 3. Add force_style to control subtitle appearance
      const ffmpegCommand = `"${FFMPEG_PATH}" -i "${localVideoPath}" -vf "subtitles='${srtPathForFfmpeg}':force_style='FontSize=24,Alignment=2,BorderStyle=3'" -c:v libx264 -c:a copy -preset fast "${localOutputPath}"`;
      
      console.log('Executing FFmpeg command:', ffmpegCommand);
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log('FFmpeg processing completed successfully');
    } catch (ffmpegError) {
      console.error('FFmpeg execution failed:', ffmpegError);
      
      // Try an alternative approach using movtext codec
      console.log('Attempting alternative FFmpeg approach with movtext');
      try {
        const alternativeCommand = `"${FFMPEG_PATH}" -i "${localVideoPath}" -i "${localSrtPath}" -c:v libx264 -c:a copy -c:s mov_text -metadata:s:s:0 language=eng "${localOutputPath}"`;
        console.log('Executing alternative command:', alternativeCommand);
        execSync(alternativeCommand, { stdio: 'inherit' });
        console.log('Alternative FFmpeg command completed successfully');
      } catch (altError) {
        console.error('Alternative FFmpeg approach failed:', altError);
        
        // Last resort: Use the libass filter with explicit dimensions
        try {
          // Get video dimensions first
          const getDimensionsCommand = `"${FFMPEG_PATH}" -i "${localVideoPath}" -hide_banner`;
          let videoDimensions = '640x360'; // Default fallback
          
          try {
            const dimensionOutput = execSync(getDimensionsCommand, { encoding: 'utf8' });
            const dimensionMatch = dimensionOutput.match(/Stream .* Video:.* (\d+)x(\d+)/);
            if (dimensionMatch && dimensionMatch[1] && dimensionMatch[2]) {
              videoDimensions = `${dimensionMatch[1]}x${dimensionMatch[2]}`;
              console.log('Detected video dimensions:', videoDimensions);
            }
          } catch (dimError) {
            console.log('Could not detect video dimensions, using default:', videoDimensions);
          }
          
          // Try with hardcoded dimensions for the subtitle filter
          const finalCommand = `"${FFMPEG_PATH}" -i "${localVideoPath}" -vf "subtitles='${srtPathForFfmpeg}':original_size=${videoDimensions}" -c:v libx264 -c:a copy -preset fast "${localOutputPath}"`;
          console.log('Executing final attempt command:', finalCommand);
          execSync(finalCommand, { stdio: 'inherit' });
          console.log('Final FFmpeg attempt completed successfully');
        } catch (finalError) {
          console.error('All FFmpeg approaches failed:', finalError);
          throw new Error('Failed to embed subtitles after multiple attempts');
        }
      }
    }

    console.log('Video processing completed, uploading to S3');
    
    // Check if output file exists and has size
    if (!fs.existsSync(localOutputPath)) {
      throw new Error('Output video file was not created');
    }
    
    const fileStats = fs.statSync(localOutputPath);
    if (fileStats.size === 0) {
      throw new Error('Output video file is empty');
    }

    // Upload processed video to S3
    console.log('Reading output file for S3 upload');
    let fileBuffer;
    try {
      const fileStream = fs.createReadStream(localOutputPath);
      fileBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        fileStream.on('data', (chunk) => chunks.push(chunk));
        fileStream.on('error', reject);
        fileStream.on('end', () => resolve(Buffer.concat(chunks)));
      });
      console.log(`Successfully read ${fileBuffer.length} bytes from output file`);
    } catch (readError) {
      console.error('Error reading output file:', readError);
      throw new Error(`Failed to read output file: ${readError.message}`);
    }
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: processedVideoFileName,
      Body: fileBuffer,
      ContentType: 'video/mp4'
    };
    
    console.log('Uploading processed video to S3:', processedVideoFileName);
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Generate a signed URL for the processed video
    const signedUrlParams = {
      Bucket: BUCKET_NAME,
      Key: processedVideoFileName
    };
    
    const signedUrlCommand = new GetObjectCommand(signedUrlParams);
    const signedUrl = await getSignedUrl(s3Client, signedUrlCommand, { expiresIn: 604800 }); // 1 week expiration
    
    console.log('Generated signed URL for processed video');
    
    // Clean up the output file now that it's been uploaded
    if (localOutputPath && fs.existsSync(localOutputPath)) {
      try {
        fs.unlinkSync(localOutputPath);
        console.log('Successfully deleted output file after upload');
      } catch (deleteError) {
        console.error('Error deleting output file:', deleteError);
      }
    }
    
    return NextResponse.json({
      success: true,
      processedVideoUrl: signedUrl,
      fileName: processedVideoFileName
    });
    
  } catch (error) {
    console.error('Error processing video:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process video',
        details: error.stack
      }, 
      { status: 500 }
    );
  } finally {
    // Clean up temporary files
    console.log('Cleaning up temporary files');
    try {
      // Don't delete the output file until after it's been uploaded to S3
      if (localVideoPath && fs.existsSync(localVideoPath)) fs.unlinkSync(localVideoPath);
      if (localSrtPath && fs.existsSync(localSrtPath)) fs.unlinkSync(localSrtPath);
      // localOutputPath is handled separately after S3 upload
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }
  }
}