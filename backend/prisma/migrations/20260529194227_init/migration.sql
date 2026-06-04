-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Metrica" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" TEXT NOT NULL,
    "peso" REAL NOT NULL,
    "altura" REAL NOT NULL,
    "cintura" REAL NOT NULL,
    "grasa" REAL,
    "fecha_metrica" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Metrica_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sueno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" TEXT NOT NULL,
    "horasDormidas" REAL NOT NULL,
    "calidadSueno" TEXT NOT NULL,
    "fechaSueno" DATETIME NOT NULL,
    CONSTRAINT "Sueno_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    CONSTRAINT "Actividad_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comida" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    CONSTRAINT "Comida_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HabitosyAgua" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" TEXT NOT NULL,
    "aguaConsumida" REAL NOT NULL,
    "aguaRecomendada" REAL NOT NULL,
    "vegetales" BOOLEAN NOT NULL,
    "azucar" BOOLEAN NOT NULL,
    "proteina" BOOLEAN NOT NULL,
    "fruta" BOOLEAN NOT NULL,
    "fecha" DATETIME NOT NULL,
    CONSTRAINT "HabitosyAgua_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "HabitosyAgua_idUsuario_fecha_key" ON "HabitosyAgua"("idUsuario", "fecha");
