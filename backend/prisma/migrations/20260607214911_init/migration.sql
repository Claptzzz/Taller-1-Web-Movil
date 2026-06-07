-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metrica" (
    "id" SERIAL NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "altura" DOUBLE PRECISION NOT NULL,
    "cintura" DOUBLE PRECISION NOT NULL,
    "grasa" DOUBLE PRECISION,
    "fecha_metrica" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metrica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sueno" (
    "id" SERIAL NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "horasDormidas" DOUBLE PRECISION NOT NULL,
    "calidadSueno" TEXT NOT NULL,
    "fechaSueno" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sueno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" SERIAL NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comida" (
    "id" SERIAL NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitosyAgua" (
    "id" SERIAL NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "aguaConsumida" DOUBLE PRECISION NOT NULL,
    "aguaRecomendada" DOUBLE PRECISION NOT NULL,
    "vegetales" BOOLEAN NOT NULL,
    "azucar" BOOLEAN NOT NULL,
    "proteina" BOOLEAN NOT NULL,
    "fruta" BOOLEAN NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitosyAgua_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "HabitosyAgua_idUsuario_fecha_key" ON "HabitosyAgua"("idUsuario", "fecha");

-- AddForeignKey
ALTER TABLE "Metrica" ADD CONSTRAINT "Metrica_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sueno" ADD CONSTRAINT "Sueno_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comida" ADD CONSTRAINT "Comida_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitosyAgua" ADD CONSTRAINT "HabitosyAgua_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
