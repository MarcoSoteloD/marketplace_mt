"use client";

// Importa 'Image' de 'next/image'
import Image, { type ImageProps } from 'next/image';

// Acepta 'ImageProps' (de next/image)
export default function CloudinaryImage({ alt, ...props }: ImageProps) {
  // Renderiza el componente 'Image' de Next.js
  return <Image alt={alt} {...props} />;
}