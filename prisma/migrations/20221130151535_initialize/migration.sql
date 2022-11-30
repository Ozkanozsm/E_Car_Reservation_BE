-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "wallet_addr" CHAR(42) NOT NULL,
    "total_spent" INTEGER NOT NULL DEFAULT 0,
    "total_reservation" INTEGER NOT NULL DEFAULT 0,
    "total_cancelled" INTEGER NOT NULL DEFAULT 0,
    "total_completed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "reserver_wallet_addr" CHAR(42) NOT NULL,
    "reserved_wallet_addr" CHAR(42) NOT NULL,
    "value" INTEGER NOT NULL,
    "reserved_time" TIMESTAMP(3) NOT NULL,
    "start_time" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "create_tx" CHAR(66) NOT NULL,
    "bill_tx" CHAR(66),
    "status" INTEGER NOT NULL DEFAULT 0,
    "cancel_tx" CHAR(66),
    "complete_tx" CHAR(66),

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "wallet_addr" CHAR(42) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "total_slots" INTEGER NOT NULL,
    "total_earned" INTEGER NOT NULL DEFAULT 0,
    "total_reserved" INTEGER NOT NULL DEFAULT 0,
    "total_cancelled" INTEGER NOT NULL DEFAULT 0,
    "total_completed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pricing" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_addr_key" ON "User"("wallet_addr");

-- CreateIndex
CREATE UNIQUE INDEX "Station_wallet_addr_key" ON "Station"("wallet_addr");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_reserver_wallet_addr_fkey" FOREIGN KEY ("reserver_wallet_addr") REFERENCES "User"("wallet_addr") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_reserved_wallet_addr_fkey" FOREIGN KEY ("reserved_wallet_addr") REFERENCES "Station"("wallet_addr") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_id_fkey" FOREIGN KEY ("id") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
