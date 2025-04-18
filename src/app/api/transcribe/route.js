import { GetObjectCommand, S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { 
  GetTranscriptionJobCommand, 
  StartTranscriptionJobCommand, 
  TranscribeClient 
} from "@aws-sdk/client-transcribe";

// Global job tracker - persists between API calls
const GLOBAL_JOB_TRACKER = new Map();

// Configure AWS clients
function getTranscribeClient() {
  return new TranscribeClient({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function getS3Client() {
  return new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Utility: Convert stream to string
async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
}

// Try to get transcription result from S3, using job details from AWS Transcribe
async function getTranscriptionFromJobDetails(jobName) {
  try {
    const transcribeClient = getTranscribeClient();
    const jobDetailsCommand = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    });
    
    const jobDetails = await transcribeClient.send(jobDetailsCommand);
    
    if (jobDetails.TranscriptionJob.TranscriptionJobStatus === "COMPLETED") {
      // Get the S3 URI where AWS Transcribe stored the output
      const transcriptUri = jobDetails.TranscriptionJob.Transcript?.TranscriptFileUri;
      
      if (transcriptUri) {
        console.log(`Found transcript URI: ${transcriptUri}`);
        
        // Properly parse the S3 URI
        // Example URI: https://s3.ap-south-1.amazonaws.com/pzwl-captionator/transcripts/job-name.json
        try {
          // Extract bucket and key from HTTPS URI
          const url = new URL(transcriptUri);
          const pathParts = url.pathname.split('/');
          // First part of path after hostname is bucket name
          const bucket = pathParts[1];
          // Rest of the path is the key
          const key = pathParts.slice(2).join('/');
          
          console.log(`Fetching from bucket: ${bucket}, key: ${key}`);
          
          // Get the actual transcript file
          const s3client = getS3Client();
          const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          });
          
          const response = await s3client.send(getObjectCommand);
          if (response?.Body) {
            const contentStr = await streamToString(response.Body);
            return JSON.parse(contentStr);
          }
        } catch (parseError) {
          console.log(`Error parsing URI ${transcriptUri}: ${parseError.message}`);
          
          // Fallback to the old approach if the new approach fails
          if (transcriptUri.startsWith('s3://')) {
            const uriParts = transcriptUri.replace('s3://', '').split('/');
            const bucket = uriParts[0];
            const key = uriParts.slice(1).join('/');
            
            console.log(`Fallback: Fetching from bucket: ${bucket}, key: ${key}`);
            
            const s3client = getS3Client();
            const getObjectCommand = new GetObjectCommand({
              Bucket: bucket,
              Key: key,
            });
            
            const response = await s3client.send(getObjectCommand);
            if (response?.Body) {
              const contentStr = await streamToString(response.Body);
              return JSON.parse(contentStr);
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(`Error getting transcript for job ${jobName}: ${e.message}`);
  }
  return null;
}

// Search for transcript in S3 using job name pattern
async function searchForTranscript(jobName) {
  try {
    const s3client = getS3Client();
    
    // Look for files with the job name in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: `transcripts/${jobName}`,
      MaxKeys: 10,
    });
    
    const results = await s3client.send(listCommand);
    
    if (results.Contents && results.Contents.length > 0) {
      console.log(`Found ${results.Contents.length} potential transcript files`);
      
      // Try each file that seems like it could be a transcript
      for (const item of results.Contents) {
        if (item.Key.endsWith('.json')) {
          console.log(`Trying to get transcript from ${item.Key}`);
          
          const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: item.Key,
          });
          
          try {
            const response = await s3client.send(getObjectCommand);
            if (response?.Body) {
              const contentStr = await streamToString(response.Body);
              return JSON.parse(contentStr);
            }
          } catch (err) {
            console.log(`Error getting ${item.Key}: ${err.message}`);
          }
        }
      }
    }
  } catch (e) {
    console.log(`Error searching for transcript: ${e.message}`);
  }
  return null;
}

// Check job status with AWS
async function checkJobStatus(jobName) {
  try {
    const transcribeClient = getTranscribeClient();
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    });
    
    return await transcribeClient.send(command);
  } catch (e) {
    console.log(`Error checking job status for ${jobName}: ${e.message}`);
    return null;
  }
}

// Create a new transcription job
async function createTranscriptionJob(filename) {
  // Simple job name based on the file with timestamp
  const fileBase = filename.split('.')[0]; 
  const jobName = `${fileBase}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, '-');
  
  const transcribeClient = getTranscribeClient();
  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: "en-US", // Specify language code
    MediaFormat: filename.split('.').pop().toLowerCase(), // Get extension as format
    Media: {
      MediaFileUri: `s3://${process.env.BUCKET_NAME}/${filename}`,
    },
    // IMPORTANT: AWS requires the output bucket to be in the same region as the Transcribe service
    OutputBucketName: process.env.BUCKET_NAME,
    // Adding the output key tells AWS exactly where to put the transcript
    OutputKey: `transcripts/${jobName}.json`,
  });
  
  try {
    const response = await transcribeClient.send(command);
    console.log(`Started job ${jobName} for file ${filename}`);
    return response.TranscriptionJob;
  } catch (error) {
    console.error(`Failed to start job for ${filename}:`, error);
    throw error;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return Response.json({ error: "Filename is required" }, { status: 400 });
    }

    console.log(`Processing request for ${filename}`);
    
    // Step 1: Check if we already have a job for this file
    const jobInfo = GLOBAL_JOB_TRACKER.get(filename);
    
    if (jobInfo) {
      console.log(`Found existing job ${jobInfo.jobName} for ${filename}`);
      
      // Step 2: Check job status
      const jobStatus = await checkJobStatus(jobInfo.jobName);
      
      if (!jobStatus) {
        // Job not found - could have expired
        console.log(`Job ${jobInfo.jobName} not found, will create new job`);
        GLOBAL_JOB_TRACKER.delete(filename);
      } else {
        // Job exists, update its status
        const status = jobStatus.TranscriptionJob.TranscriptionJobStatus;
        console.log(`Job ${jobInfo.jobName} status: ${status}`);
        
        // Step 3: If job is completed, get the transcript
        if (status === "COMPLETED") {
          // Try to get transcript from job details
          console.log(`Job ${jobInfo.jobName} is complete, looking for transcript`);
          const transcript = await getTranscriptionFromJobDetails(jobInfo.jobName);
          
          if (transcript) {
            console.log(`Found transcript for job ${jobInfo.jobName}`);
            return Response.json({
              status: "COMPLETED",
              transcription: transcript,
            });
          } else {
            // If we can't find it the usual way, try searching
            console.log(`Trying alternate search for transcript of job ${jobInfo.jobName}`);
            const searchedTranscript = await searchForTranscript(jobInfo.jobName);
            
            if (searchedTranscript) {
              console.log(`Found transcript via search for job ${jobInfo.jobName}`);
              return Response.json({
                status: "COMPLETED",
                transcription: searchedTranscript,
              });
            }
            
            // Still no transcript found - direct search in the bucket
            try {
              console.log(`Trying direct search in bucket for job transcript`);
              const s3client = getS3Client();
              const getObjectCommand = new GetObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: `transcripts/${jobInfo.jobName}.json`,
              });
              
              const response = await s3client.send(getObjectCommand);
              if (response?.Body) {
                const contentStr = await streamToString(response.Body);
                const parsedTranscript = JSON.parse(contentStr);
                console.log(`Found transcript directly in bucket for job ${jobInfo.jobName}`);
                return Response.json({
                  status: "COMPLETED",
                  transcription: parsedTranscript,
                });
              }
            } catch (directError) {
              console.log(`Direct search error: ${directError.message}`);
            }
            
            // Still no transcript found
            console.log(`Transcript not found for completed job ${jobInfo.jobName}`);
            return Response.json({
              status: "TRANSCRIPT_PENDING",
              message: "Job is complete but transcript is not available yet",
              jobName: jobInfo.jobName,
            });
          }
        }
        
        // Job is still in progress
        return Response.json({
          status: status,
          jobName: jobInfo.jobName,
          message: `Transcription job is ${status.toLowerCase()}`,
          createdAt: jobInfo.createdAt,
          elapsedTime: Math.floor((Date.now() - jobInfo.createdAt) / 1000) + " seconds"
        });
      }
    }
    
    // Step 4: Create new job if we don't have one
    console.log(`Creating new job for ${filename}`);
    const newJob = await createTranscriptionJob(filename);
    
    // Save job info in our tracker
    GLOBAL_JOB_TRACKER.set(filename, {
      jobName: newJob.TranscriptionJobName,
      createdAt: Date.now(),
      status: newJob.TranscriptionJobStatus
    });
    
    return Response.json({
      status: newJob.TranscriptionJobStatus,
      jobName: newJob.TranscriptionJobName,
      message: "New transcription job created"
    });
    
  } catch (error) {
    console.error("API Error:", error);
    
    // Extract AWS-specific error info if available
    const awsError = error.$metadata ? {
      requestId: error.$metadata.requestId,
      httpStatusCode: error.$metadata.httpStatusCode,
    } : {};
    
    return Response.json({
      error: error.message,
      ...awsError,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}