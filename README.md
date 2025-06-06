# Captionator

Captionator is a web application for automatically generating captions (subtitles) for videos using AI-powered transcription. Built with [Next.js](https://nextjs.org), it enables users to upload videos, transcribe speech to text, and generate downloadable SRT caption files. The app uses AWS Transcribe for high-accuracy speech recognition and stores results in AWS S3.

## Features

- Upload and process videos in major formats (MP4, MOV, AVI, WebM; max size 500MB)
- Automatic transcription of video audio using AWS Transcribe (98%+ accuracy for clear audio)
- Download captions as SRT files
- Edit and refine captions in a user-friendly editor
- Status tracking for transcription jobs
- Secure and scalable cloud storage on AWS S3

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Next.js API routes
- **Cloud & Storage:** AWS S3, AWS Transcribe
- **Media Processing:** FFmpeg, fluent-ffmpeg, ffmpeg-static
- **Other:** Vercel (deployment), next/font, Geist font, AWS SDK, uuid, dotenv

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Make sure to set the following environment variables for AWS integration:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: `ap-south-1`)
- `S3_BUCKET_NAME` (default: `pzwl-captionator`)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT

---
**Support**: For questions or support, contact [the repository owner](https://github.com/pzwl).
