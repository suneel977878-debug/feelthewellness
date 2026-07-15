-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `images` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `subcategory` VARCHAR(191) NULL,
    `features` VARCHAR(191) NOT NULL,
    `isNew` BOOLEAN NOT NULL DEFAULT false,
    `isBestSeller` BOOLEAN NOT NULL DEFAULT false,
    `isOnSale` BOOLEAN NOT NULL DEFAULT false,
    `discountPercent` DOUBLE NULL,
    `rating` DOUBLE NOT NULL DEFAULT 5.0,
    `reviews` INTEGER NOT NULL DEFAULT 0,
    `color` VARCHAR(191) NOT NULL,
    `silhouetteType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `deliveryStatus` VARCHAR(191) NULL,
    `deliveryNote` VARCHAR(191) NULL,
    `utr` VARCHAR(191) NULL,
    `paymentApp` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `customerAddress` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromoCode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discountPct` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PromoCode_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoreConfig` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `ageGateEnabled` BOOLEAN NOT NULL DEFAULT true,
    `storeUpiId` VARCHAR(191) NOT NULL DEFAULT 'luxurydiscreet@ybl',
    `paytmMid` VARCHAR(191) NOT NULL DEFAULT '',
    `paytmKey` VARCHAR(191) NOT NULL DEFAULT '',
    `paytmEnv` VARCHAR(191) NOT NULL DEFAULT 'SIMULATED',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

