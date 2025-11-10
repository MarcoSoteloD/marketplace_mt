// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'; // <-- Esto viene de 'npm install cloudinary'
import { Readable } from 'stream';

// Se configura solo con la URL de tu .env
cloudinary.config(); 

export async function uploadImageToCloudinary(file: File, folder: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Error subiendo a Cloudinary:", error);
          return reject(new Error("No se pudo subir la imagen."));
        }
        if (!result) {
          return reject(new Error("Respuesta inválida de Cloudinary."));
        }
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}