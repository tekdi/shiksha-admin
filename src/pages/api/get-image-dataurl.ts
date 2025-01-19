import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const imageUrl = req.query.imageUrl as string;

  if (!imageUrl) {
    res.status(400).json({ error: "Image URL is required" });
    return;
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type");
    if (!contentType) {
      throw new Error("Unable to determine content type");
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    // Extract the filename from the URL
    const filename = path.basename(new URL(imageUrl).pathname);
console.log("filename",filename)
    res.status(200).json({ dataUrl, filename });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
