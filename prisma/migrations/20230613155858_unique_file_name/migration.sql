/*
  Warnings:

  - A unique constraint covering the columns `[cameraName]` on the table `camera` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "camera_cameraName_key" ON "camera"("cameraName");
