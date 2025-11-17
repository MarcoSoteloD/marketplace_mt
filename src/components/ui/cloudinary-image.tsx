"use client";

// 1. Importa 'Image' de 'next/image' en lugar de 'next-cloudinary'
import Image, { type ImageProps } from 'next/image';

// 2. Acepta 'ImageProps' (de next/image)
export default function CloudinaryImage(props: ImageProps) {
  // 3. Renderiza el componente 'Image' de Next.js
  return <Image {...props} />;
}