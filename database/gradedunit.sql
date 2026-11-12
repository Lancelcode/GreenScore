-- GreenScore schema and demo seed data.
--
-- Demo accounts (local/demo use only — change or remove before going live):
--   admins: admin@greenscore.com, ecoadmin@greenscore.com, info@carbonco.com
--           password GreenAdmin2026
--   users:  every other seeded account, e.g. hello@ecoventures.com
--           password GreenDemo2026
-- Card rows hold test-card last-four digits only.
--
-- Keys and AUTO_INCREMENT are declared inside each CREATE TABLE so the file
-- also loads on MySQL-compatible databases such as TiDB.
--
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 02, 2026 at 01:35 PM
-- Server version: 10.4.32-MariaDB
-- (Originally exported from phpMyAdmin for the PHP version of GreenScore.)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gradedunit`
--

-- --------------------------------------------------------

--
-- Table structure for table `community_tips`
--

CREATE TABLE `community_tips` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `community_tips`
--

INSERT INTO `community_tips` (`id`, `user_id`, `message`, `created_at`) VALUES
(29, 36, 'We switched all office lighting to LED and cut energy costs by 30% in one quarter.', '2025-05-02 09:25:36'),
(38, 39, 'Started a company-wide recycling programme — engagement from staff has been brilliant.', '2025-05-02 16:45:09'),
(39, 40, 'Moved to paperless invoicing and eliminated over 2,000 printed documents per year.', '2025-05-02 18:22:40'),
(40, 36, 'Partnered with a local carbon offset scheme — highly recommend looking into this.', '2025-05-07 13:06:53'),
(41, 36, 'Installed solar panels on our warehouse roof. ROI within 4 years and zero emissions.', '2025-05-07 13:37:03'),
(42, 36, 'Switched our company fleet to electric vehicles. Charging is cheaper than fuel.', '2025-05-07 13:37:13'),
(43, 36, 'Reduced single-use plastics in our canteen entirely. Staff adapted quickly.', '2025-05-07 13:37:16'),
(44, 36, 'Remote working two days per week cut our commuter emissions by nearly 40%.', '2025-05-07 13:37:19'),
(45, 36, 'Water-saving taps installed across all facilities. Small change, big impact.', '2025-05-07 13:37:26'),
(46, 36, 'Started measuring our Scope 3 emissions this year. Eye-opening and highly recommended.', '2025-05-07 13:37:30'),
(47, 37, 'Joined a local sustainability network — sharing knowledge with peers has accelerated our progress.', '2025-05-07 14:38:56'),
(54, 34, 'Switched to a green energy supplier — renewable electricity now powers our entire office.', '2026-04-01 09:00:00'),
(55, 39, 'Set up a staff sustainability committee to drive internal eco-initiatives month by month.', '2026-04-05 10:30:00'),
(56, 47, 'Introduced a cycle-to-work scheme — 12 staff now commute by bike, cutting transport emissions.', '2026-04-10 14:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `credit_cards`
--

CREATE TABLE `credit_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `card_last4` char(4) NOT NULL COMMENT 'Only the last four digits are stored; never the full number or CVV',
  `expiry_date` date NOT NULL,
  `cardholder_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `credit_cards`
--

INSERT INTO `credit_cards` (`id`, `user_id`, `card_last4`, `expiry_date`, `cardholder_name`, `created_at`) VALUES
(38, 35, '1111', '2025-05-01', 'Sarah Mitchell', '2025-05-01 19:17:11'),
(39, 39, '2222', '2025-05-08', 'Joe Doe', '2025-05-02 17:17:15'),
(40, 47, '3333', '2026-04-11', 'David Sow', '2026-04-23 18:58:03'),
(41, 34, '4444', '2026-04-24', 'GreenScore Admin', '2026-04-24 20:02:06');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `visible_to_public` tinyint(1) DEFAULT 0,
  `admin_response` text DEFAULT NULL,
  `admin_username` varchar(100) DEFAULT NULL,
  `admin_response_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `user_id`, `name`, `email`, `message`, `created_at`, `visible_to_public`, `admin_response`, `admin_username`, `admin_response_at`) VALUES
(10, NULL, 'GreenTech Solutions', 'contact@greentech.com', 'Great platform, really helped us identify areas for improvement in our sustainability practices.', '2025-05-01 21:45:49', 1, 'Thank you for your feedback. We are glad GreenScore is making a difference for your organisation.', 'test1', '2026-04-24 21:18:42'),
(11, NULL, 'GreenTech Solutions', 'contact@greentech.com', 'Great platform, really helped us identify areas for improvement in our sustainability practices.', '2025-05-01 21:45:57', 1, 'Thank you for your feedback. We are glad GreenScore is making a difference for your organisation.', 'test1', '2026-04-24 21:18:42'),
(12, 35, 'GreenTech Solutions', 'contact@greentech.com', 'Great platform, really helped us identify areas for improvement in our sustainability practices.', '2025-05-01 21:46:35', 1, 'Thank you for your feedback. We are glad GreenScore is making a difference for your organisation.', 'test1', '2026-04-24 21:18:42'),
(14, 40, 'cris', 'crif@gmail.com', 'The certificate system is a great incentive for our team to keep improving.', '2025-05-02 17:23:03', 1, 'We appreciate your kind words. Keep working towards that Gold certificate!', 'test1', '2026-04-24 21:18:42'),
(15, 39, 'Joe', 'joe@joe.com', 'Really intuitive platform. The green calculator gave us clear actionable insights.', '2025-05-02 18:22:20', 1, 'Thank you for taking the time to share this. We hope to see you reach Gold soon.', 'test1', '2026-04-24 21:18:42'),
(16, 39, 'Joe', 'joe@joe.com', 'Excellent tool for benchmarking our environmental impact year on year.', '2025-05-02 18:31:46', 1, 'Fantastic to hear. Consistent benchmarking is key to real sustainability progress.', 'test1', '2026-04-24 21:18:42'),
(18, 36, 'EcoAdmin', 'ecoadmin@greenscore.com', 'The badge system is a brilliant touch. Our team is now competing to improve our score.', '2025-05-07 12:32:45', 1, 'Love hearing this — that is exactly what the badge system was designed for!', 'test1', '2026-04-24 21:18:42'),
(19, 36, 'EcoAdmin', 'ecoadmin@greenscore.com', 'Very well structured assessment. Would love to see more categories added in the future.', '2025-05-07 12:32:53', 1, 'Great suggestion — we are always looking to expand the assessment categories.', 'test1', '2026-04-24 21:18:42'),
(20, 37, 'CarbonCo', 'info@carbonco.com', 'Simple to use and the certificate looks very professional. Impressed overall.', '2025-05-07 13:39:04', 1, 'Thank you for the positive feedback. The certificates are designed to be share-worthy!', 'test1', '2026-04-24 21:18:42'),
(21, 47, 'CleanFuture Ltd', 'team@cleanfuture.co.uk', 'Would recommend GreenScore to any organisation serious about sustainability.', '2025-05-07 15:13:52', 1, 'That means a lot to us. Thank you for your support!', 'test1', '2026-04-24 21:18:42');

-- --------------------------------------------------------

--
-- Table structure for table `green_calculator_results`
--

CREATE TABLE `green_calculator_results` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `total_score` int(11) NOT NULL,
  `green_count` int(11) NOT NULL,
  `amber_count` int(11) NOT NULL,
  `red_count` int(11) NOT NULL,
  `award_level` varchar(50) NOT NULL,
  `emoji` char(2) DEFAULT NULL,
  `feedback_message` text DEFAULT NULL,
  `shortfall` int(11) NOT NULL,
  `donation_cost` decimal(6,2) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `green_calculator_results`
--

INSERT INTO `green_calculator_results` (`id`, `user_id`, `total_score`, `green_count`, `amber_count`, `red_count`, `award_level`, `emoji`, `feedback_message`, `shortfall`, `donation_cost`, `submitted_at`) VALUES
(98, 35, 0, 0, 0, 10, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 1.00, '2025-05-01 21:25:32'),
(99, 35, 75, 6, 3, 1, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 250.00, '2025-05-01 21:28:28'),
(100, 36, 75, 7, 1, 2, 'Certificate of Silver 🥈', '🥈', 'Great job! You\'re making a positive environmental impact.', 25, 250.00, '2025-05-02 08:07:05'),
(101, 36, 75, 7, 1, 2, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 250.00, '2025-05-02 08:11:10'),
(102, 36, 75, 7, 1, 2, 'Certificate of Silver 🥈', '🥈', 'Great job! You\'re making a positive environmental impact.', 25, 250.00, '2025-05-02 08:18:40'),
(103, 37, 65, 5, 3, 2, 'Certificate of Silver 🥈', '🥈', 'Great job! You\'re making a positive environmental impact.', 35, 350.00, '2025-05-02 09:25:59'),
(106, 40, 80, 7, 2, 1, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 200.00, '2025-05-02 17:21:40'),
(108, 39, 80, 7, 2, 1, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 200.00, '2025-05-07 10:51:19'),
(109, 36, 100, 10, 0, 0, 'Certificate of Gold 🥇', '🥇', 'Outstanding! You\'re leading the way in sustainability.', 0, 0.00, '2025-05-07 12:03:36'),
(110, 36, 0, 0, 0, 10, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 1.00, '2025-05-07 12:04:27'),
(111, 36, 65, 4, 5, 1, 'Certificate of Silver 🥈', '🥈', 'Great job! You\'re making a positive environmental impact.', 35, 350.00, '2025-05-07 12:05:06'),
(112, 36, 65, 4, 5, 1, 'Certificate of Silver 🥈', '🥈', 'Great job! You\'re making a positive environmental impact.', 35, 350.00, '2025-05-07 12:05:18'),
(113, 36, 55, 3, 5, 2, 'Certificate of Bronze 🥉', '🥉', 'Nice effort! Keep building sustainable habits.', 45, 450.00, '2025-05-07 12:05:29'),
(114, 36, 45, 2, 5, 3, 'Certificate of participation 👏', '🌟', 'You\'re almost there! Just a few more changes will go a long way.', 55, 550.00, '2025-05-07 12:05:39'),
(115, 36, 40, 2, 4, 4, 'Certificate of participation 👏', '💪', 'You\'re making progress. Small steps matter — keep going!', 60, 600.00, '2025-05-07 12:05:52'),
(116, 36, 35, 2, 3, 5, 'Certificate of participation 👏', '💪', 'You\'re making progress. Small steps matter — keep going!', 65, 650.00, '2025-05-07 12:06:04'),
(117, 36, 25, 1, 3, 6, 'Certificate of participation 👏', '🌱', 'Every journey starts somewhere — you\'ve taken that first step!', 75, 750.00, '2025-05-07 12:06:13'),
(123, 47, 25, 1, 3, 6, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 750.00, '2026-04-23 19:12:27'),
(124, 48, 0, 0, 0, 0, 'Initial Registration 🎟️', '🎟️', 'Thank you for joining GreenScore!', 0, 0.00, '2026-04-23 19:44:17'),
(125, 39, 55, 3, 5, 2, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 450.00, '2026-04-23 22:39:19'),
(126, 39, 0, 0, 0, 10, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 1000.00, '2026-04-23 22:50:05'),
(127, 49, 0, 0, 0, 0, 'Initial Registration 🎟️', '🎟️', 'Thank you for joining GreenScore!', 0, 0.00, '2026-04-24 19:53:40'),
(128, 34, 80, 6, 4, 0, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 200.00, '2026-04-24 20:23:12'),
(129, 34, 25, 1, 3, 6, 'Certificate of Gold 🥇', '🥇', 'Thank you for your contribution! You\'ve unlocked full recognition!', 0, 750.00, '2026-04-27 21:04:06');

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `attempted_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ip` (`ip_address`),
  KEY `idx_email` (`email`),
  KEY `idx_time` (`attempted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `new_users`
--

CREATE TABLE `new_users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','inactive','deactivated') NOT NULL DEFAULT 'active',
  `company_name` varchar(100) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `new_users`
--

INSERT INTO `new_users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `status`, `company_name`, `contact_person`, `phone_number`) VALUES
(34, 'GreenScore Admin', 'admin@greenscore.com', '$2y$10$v8Ma/bCCLAJOFfoK7BOQv.o5SJutrqvRu2hlQAOzWzyUt5yjP0.WG', 'admin', '2025-05-01 17:23:54', 'active', 'GreenScore', 'Administrator', '07700000001'),
(35, 'GreenTech Solutions', 'contact@greentech.com', '$2y$10$2MqWODaHFsGESEmHdUEq2.QoSwDw3R2kYJyQFmYTW7NIuQ52VI3Ua', 'user', '2025-05-01 17:34:52', 'active', 'GreenTech Solutions Ltd', 'Sarah Mitchell', '07911234567'),
(36, 'EcoAdmin', 'ecoadmin@greenscore.com', '$2y$10$v8Ma/bCCLAJOFfoK7BOQv.o5SJutrqvRu2hlQAOzWzyUt5yjP0.WG', 'admin', '2025-05-01 21:47:23', 'active', 'GreenScore', 'Administrator', '07911234568'),
(37, 'CarbonCo', 'info@carbonco.com', '$2y$10$v8Ma/bCCLAJOFfoK7BOQv.o5SJutrqvRu2hlQAOzWzyUt5yjP0.WG', 'admin', '2025-05-02 00:26:03', 'inactive', 'Carbon Co Ltd', 'James Walker', '07911234569'),
(39, 'EcoVentures', 'hello@ecoventures.com', '$2y$10$2MqWODaHFsGESEmHdUEq2.QoSwDw3R2kYJyQFmYTW7NIuQ52VI3Ua', 'user', '2025-05-02 12:24:05', 'active', 'EcoVentures UK', 'Joe Doe', '07911234570'),
(40, 'SustainCorp', 'info@sustaincorp.com', '$2y$10$2MqWODaHFsGESEmHdUEq2.QoSwDw3R2kYJyQFmYTW7NIuQ52VI3Ua', 'user', '2025-05-02 17:20:19', 'active', 'SustainCorp Ltd', 'Chris Reid', '07911234571'),
(41, 'BluePlanet Co', 'info@blueplanet.co.uk', '$2y$10$2MqWODaHFsGESEmHdUEq2.QoSwDw3R2kYJyQFmYTW7NIuQ52VI3Ua', 'user', '2025-05-02 19:09:47', 'deactivated', 'BluePlanet Co', 'Mark Jensen', '07700000004'),
(47, 'CleanFuture Ltd', 'team@cleanfuture.co.uk', '$2y$10$2MqWODaHFsGESEmHdUEq2.QoSwDw3R2kYJyQFmYTW7NIuQ52VI3Ua', 'user', '2025-05-07 14:55:47', 'deactivated', 'CleanFuture Ltd', 'Anna Torres', '07700000005'),
(48, 'EcoPath Ltd', 'contact@ecopath.co.uk', '$2y$10$2MqWODaHFsGESEmHdUEq2.QoSwDw3R2kYJyQFmYTW7NIuQ52VI3Ua', 'user', '2026-04-23 19:44:17', 'active', 'EcoPath Ltd', 'David Sow', '07700000002'),
(49, 'GreenLeaf Group', 'hello@greenleaf.co.uk', '$2y$10$2MqWODaHFsGESEmHdUEq2.QoSwDw3R2kYJyQFmYTW7NIuQ52VI3Ua', 'user', '2026-04-24 19:53:40', 'active', 'GreenLeaf Group', 'Patricia Mills', '07700000003');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `community_tips`
--
ALTER TABLE `community_tips`
  ADD CONSTRAINT `community_tips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `credit_cards`
--
ALTER TABLE `credit_cards`
  ADD CONSTRAINT `credit_cards_user_fk` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `green_calculator_results`
--
ALTER TABLE `green_calculator_results`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- --------------------------------------------------------

--
-- Table structure for table `sessions`
-- (added in GreenScore 2.0; the app also creates it on start-up if missing)
--

CREATE TABLE `sessions` (
  `id` char(64) NOT NULL COMMENT 'SHA-256 of the session token; the token itself is never stored',
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_seen_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user` (`user_id`),
  CONSTRAINT `sessions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
COMMIT;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
