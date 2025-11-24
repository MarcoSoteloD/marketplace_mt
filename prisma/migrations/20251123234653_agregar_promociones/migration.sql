-- CreateEnum
CREATE TYPE "tipo_promocion" AS ENUM ('DESCUENTO_SIMPLE', 'DOS_POR_UNO', 'TRES_POR_DOS');

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "tipo_promo" "tipo_promocion" DEFAULT 'DESCUENTO_SIMPLE';
