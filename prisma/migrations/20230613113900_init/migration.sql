-- CreateTable
CREATE TABLE "camera" (
    "url" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "cameraName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "camera_ip_key" ON "camera"("ip");
