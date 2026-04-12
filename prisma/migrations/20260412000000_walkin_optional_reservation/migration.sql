-- AlterTable: make reservationId optional for walk-in / manual participants
ALTER TABLE "Participant" ALTER COLUMN "reservationId" DROP NOT NULL;

-- AlterTable: add phone field for walk-in contact
ALTER TABLE "Participant" ADD COLUMN "phone" TEXT;

-- AlterTable: make reservationId optional for walk-in / manual operational units
ALTER TABLE "OperationalUnit" ALTER COLUMN "reservationId" DROP NOT NULL;
