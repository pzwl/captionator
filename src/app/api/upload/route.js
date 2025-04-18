import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import uniqid from "uniqid";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Generate unique ID for the file
    const fileId = uniqid();
    const extension = file.name.split(".").pop();
    const newFileName = `${fileId}.${extension}`;

    // Upload to S3
    const s3 = new S3Client({
      region: process.env.AWS_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: newFileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    // Return success response with the new filename
    return NextResponse.json({
      success: true,
      newFileName,
      message: "File uploaded successfully"
    });

  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}