-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 04, 2024 at 03:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `internship_task`
--

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL,
  `Sender_id` int(11) NOT NULL,
  `Reciver_id` int(11) NOT NULL,
  `Amount` int(11) NOT NULL,
  `Time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `Sender_id`, `Reciver_id`, `Amount`, `Time`) VALUES
(2, 10, 1, 500, '2024-07-03 15:54:38'),
(3, 10, 1, 500, '2024-07-03 16:17:02'),
(4, 10, 1, 500, '2024-07-03 17:11:54'),
(5, 10, 3, 5000, '2024-07-03 17:12:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Balance` int(11) NOT NULL DEFAULT 1000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `Username`, `Password`, `Balance`) VALUES
(1, 'Rishav', '1234', 2500),
(3, 'MOMO', '1234', 6000),
(4, 'MOMO33', '1234', 1000),
(5, 'Rishav4343', '1234', 1000),
(6, 'Rishav434312312', '$2b$10$otZi5LvOttk2vXsgbGI.xuX3U0CvUKqTbaIYjMjk666speescIPqi', 1000),
(7, 'Rishav434312312sadad', '$2b$10$0RFhW1ucVyr/qNjrmT3HPO8UzyutlvhuJt46SVZSlIV.qFw2L5g.C', 1000),
(9, 'Hellodonre', '$2b$10$uySk1mvCDz1ix4CJlbUKJOsEedajCRZbV6Nt1cTkZZXBqottHE22C', 1000),
(10, 'Testing', '$2b$10$53sqpjWYsefhfLe/iDxCg.m5/6YFSAhLiD26zO1YksyryaHTY9J.2', 994500);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `Reciver_id` (`Reciver_id`),
  ADD KEY `Sender_id` (`Sender_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`Reciver_id`) REFERENCES `users` (`Id`),
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`Sender_id`) REFERENCES `users` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
