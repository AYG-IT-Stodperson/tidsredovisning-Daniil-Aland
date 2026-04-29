-- --------------------------------------------------------
-- Värd:                         127.0.0.1
-- Serverversion:                9.1.0 - MySQL Community Server - GPL
-- Server-OS:                    Win64
-- HeidiSQL Version:             12.16.0.7229
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumpar databasstruktur för tidapp_db
CREATE DATABASE IF NOT EXISTS `tidapp_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_swedish_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tidapp_db`;

-- Dumpar struktur för tabell tidapp_db.aktiviteter
CREATE TABLE IF NOT EXISTS `aktiviteter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aktivitet` varchar(50) COLLATE utf8mb4_swedish_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aktivitet` (`aktivitet`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell tidapp_db.uppgifter
CREATE TABLE IF NOT EXISTS `uppgifter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aktivitet_id` int DEFAULT NULL,
  `datum` date NOT NULL,
  `varaktighet` time NOT NULL,
  `beskrivning` text COLLATE utf8mb4_swedish_ci,
  PRIMARY KEY (`id`),
  KEY `FK_uppgifter_aktiviteter` (`aktivitet_id`),
  CONSTRAINT `FK_uppgifter_aktiviteter` FOREIGN KEY (`aktivitet_id`) REFERENCES `aktiviteter` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

-- Dataexport var bortvalt.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
