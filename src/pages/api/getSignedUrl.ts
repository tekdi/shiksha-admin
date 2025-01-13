// import {  GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { NextApiRequest, NextApiResponse } from 'next';

// import {
//     S3Client,
//     CompleteMultipartUploadCommand,
//   } from "@aws-sdk/client-s3";
  
//   // Initialize AWS S3 client
//   const s3Client = new S3Client({
//     region: process.env.AWS_REGION, // e.g., "us-west-1"
//     credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
//     },
//   });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { fileKey } = req.query;

//   if (!fileKey || typeof fileKey !== 'string') {
//     return res.status(400).json({ error: 'File key is required' });
//   }

//   try {
//     const signedUrl = await generateSignedUrl(fileKey);
//     res.status(200).json({ signedUrl });
//   } catch (error) {
//     console.error('Error generating signed URL:', error);
//     res.status(500).json({ error: 'Failed to generate signed URL' });
//   }
// }

// // Function to generate the signed URL using getSignedUrl from @aws-sdk/s3-request-presigner
// const generateSignedUrl = async (fileKey: string): Promise<string> => {
//   const command = new GetObjectCommand({
//     Bucket: 'program-image-qa', // Replace with your S3 bucket name
//     Key: fileKey,
//   });

//   // Generate a signed URL with the expiration time set (e.g., 3600 seconds = 1 hour)
//   const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
//   return url;
// };
