-- CreateTable
CREATE TABLE "wall_layout" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "order" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "wall_layout_pkey" PRIMARY KEY ("id")
);
