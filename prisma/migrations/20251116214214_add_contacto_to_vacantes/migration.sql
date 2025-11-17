-- CreateEnum
CREATE TYPE "estado_pedido" AS ENUM ('Recibido', 'En Preparación', 'Listo para recoger', 'Entregado', 'Cancelado');

-- CreateEnum
CREATE TYPE "metodo_pago_tipo" AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'decidir_al_recoger');

-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('admin', 'gestor', 'cliente');

-- CreateTable
CREATE TABLE "categorias_globales" (
    "id_categoria_g" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_globales_pkey" PRIMARY KEY ("id_categoria_g")
);

-- CreateTable
CREATE TABLE "categorias_producto" (
    "id_categoria" SERIAL NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "orden" SMALLINT DEFAULT 0,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "categorias_producto_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "detalle_pedido" (
    "id_pedido" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "comentarios" TEXT,

    CONSTRAINT "detalle_pedido_pkey" PRIMARY KEY ("id_pedido","id_producto")
);

-- CreateTable
CREATE TABLE "negocio_categoria" (
    "id_negocio" INTEGER NOT NULL,
    "id_categoria_g" INTEGER NOT NULL,

    CONSTRAINT "negocio_categoria_pkey" PRIMARY KEY ("id_negocio","id_categoria_g")
);

-- CreateTable
CREATE TABLE "negocios" (
    "id_negocio" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "calle" VARCHAR(100),
    "num_ext" VARCHAR(10),
    "num_int" VARCHAR(10),
    "colonia" VARCHAR(100),
    "cp" VARCHAR(10),
    "municipio" VARCHAR(100),
    "estado" VARCHAR(100),
    "telefono" VARCHAR(20),
    "horario" JSONB,
    "descripcion" TEXT,
    "url_logo" VARCHAR(255),
    "galeria_fotos" JSONB,
    "url_redes_sociales" JSONB,
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "negocios_pkey" PRIMARY KEY ("id_negocio")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "comentarios" TEXT,
    "metodo_pago" "metodo_pago_tipo",
    "estado" "estado_pedido" NOT NULL DEFAULT 'Recibido',
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "id_categoria" INTEGER,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "precio_promo" DECIMAL(10,2),
    "promo_activa" BOOLEAN DEFAULT false,
    "url_foto" VARCHAR(255),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol" "rol_usuario" NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "id_negocio" INTEGER,
    "fecha_registro" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "vacantes" (
    "id_vacante" SERIAL NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "puesto" VARCHAR(100),
    "salario" DECIMAL(10,2),
    "fecha_publicacion" DATE DEFAULT CURRENT_DATE,
    "activo" BOOLEAN DEFAULT true,
    "contacto" VARCHAR(255),

    CONSTRAINT "vacantes_pkey" PRIMARY KEY ("id_vacante")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_globales_nombre_key" ON "categorias_globales"("nombre");

-- CreateIndex
CREATE INDEX "idx_categorias_producto_id_negocio" ON "categorias_producto"("id_negocio");

-- CreateIndex
CREATE UNIQUE INDEX "negocios_slug_key" ON "negocios"("slug");

-- CreateIndex
CREATE INDEX "idx_negocios_slug" ON "negocios"("slug");

-- CreateIndex
CREATE INDEX "idx_pedidos_id_negocio" ON "pedidos"("id_negocio");

-- CreateIndex
CREATE INDEX "idx_pedidos_id_usuario" ON "pedidos"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_productos_id_negocio" ON "productos"("id_negocio");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_id_negocio" ON "usuarios"("id_negocio");

-- CreateIndex
CREATE INDEX "idx_usuarios_rol" ON "usuarios"("rol");

-- CreateIndex
CREATE INDEX "idx_vacantes_id_negocio" ON "vacantes"("id_negocio");

-- AddForeignKey
ALTER TABLE "categorias_producto" ADD CONSTRAINT "fk_negocio_categorias" FOREIGN KEY ("id_negocio") REFERENCES "negocios"("id_negocio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "fk_pedido" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "fk_producto" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "negocio_categoria" ADD CONSTRAINT "fk_categoria_global" FOREIGN KEY ("id_categoria_g") REFERENCES "categorias_globales"("id_categoria_g") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "negocio_categoria" ADD CONSTRAINT "fk_negocio" FOREIGN KEY ("id_negocio") REFERENCES "negocios"("id_negocio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "fk_negocio_pedidos" FOREIGN KEY ("id_negocio") REFERENCES "negocios"("id_negocio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "fk_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "fk_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categorias_producto"("id_categoria") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "fk_negocio_productos" FOREIGN KEY ("id_negocio") REFERENCES "negocios"("id_negocio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "fk_negocio_dueño" FOREIGN KEY ("id_negocio") REFERENCES "negocios"("id_negocio") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vacantes" ADD CONSTRAINT "fk_negocio_vacantes" FOREIGN KEY ("id_negocio") REFERENCES "negocios"("id_negocio") ON DELETE CASCADE ON UPDATE NO ACTION;
