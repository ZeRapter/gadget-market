import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "ru-central-1",
  endpoint: process.env.S3_ENDPOINT || "https://s3.cloud.ru",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  // Для загрузки файла (PUT) Cloud.ru требует Path-style
  forcePathStyle: true, 
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SELLER")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Генерируем ссылку Вторым способом (через доменное имя бакета)
    // Если доменное имя не задано, ссылка не откроется, но ошибки в консоли не будет.
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.cloud.ru/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Ошибка загрузки в S3:", error);
    return NextResponse.json({ error: "Ошибка при загрузке файла" }, { status: 500 });
  }
}