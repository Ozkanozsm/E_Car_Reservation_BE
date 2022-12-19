/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Pricing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Station` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pricing_id_key" ON "Pricing"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_id_key" ON "Reservation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Station_id_key" ON "Station"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
