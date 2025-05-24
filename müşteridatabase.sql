-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı:
-- Sunucu sürümü: 8.0.42
-- PHP Sürümü: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `müşteridatabase`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `brand_owners`
--

CREATE TABLE `brand_owners` (
  `id` int NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Tablo döküm verisi `brand_owners`
--

INSERT INTO `brand_owners` (`id`, `company_name`, `email`, `password_hash`, `created_at`) VALUES

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `customers`
--

CREATE TABLE `customers` (
  `id` int NOT NULL,
  `brand_owner_id` int NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `customer_email` varchar(255) NOT NULL,
  `address` text,
  `order_details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Tablo döküm verisi `customers`
--

INSERT INTO `customers` (`id`, `brand_owner_id`, `customer_name`, `phone_number`, `customer_email`, `address`, `order_details`, `created_at`) VALUES

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int NOT NULL,
  `brand_owner_id` int NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text,
  `recipients` text,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Tablo döküm verisi `email_logs`
--

INSERT INTO `email_logs` (`id`, `brand_owner_id`, `subject`, `body`, `recipients`, `sent_at`, `status`) VALUES


--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `brand_owners`
--
ALTER TABLE `brand_owners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Tablo için indeksler `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uidx_brand_customer_email` (`brand_owner_id`,`customer_email`),
  ADD KEY `idx_brand_owner_id` (`brand_owner_id`);

--
-- Tablo için indeksler `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `brand_owner_id` (`brand_owner_id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `brand_owners`
--
ALTER TABLE `brand_owners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Tablo için AUTO_INCREMENT değeri `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`brand_owner_id`) REFERENCES `brand_owners` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `email_logs_ibfk_1` FOREIGN KEY (`brand_owner_id`) REFERENCES `brand_owners` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
