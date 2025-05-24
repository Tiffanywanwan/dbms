/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE `club` (
  `club_id` varchar(10) NOT NULL,
  `club_name` varchar(100) NOT NULL,
  PRIMARY KEY (`club_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `clubmember` (
  `student_id` varchar(20) NOT NULL,
  `club_id` varchar(10) NOT NULL,
  `role_id` int DEFAULT NULL,
  `join_semester` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`student_id`,`club_id`),
  KEY `club_id` (`club_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `clubmember_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `member` (`student_id`),
  CONSTRAINT `clubmember_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `club` (`club_id`),
  CONSTRAINT `clubmember_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `fee_assignments` (
  `fee_id` int NOT NULL,
  `student_id` varchar(20) NOT NULL,
  PRIMARY KEY (`fee_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fee_assignments_ibfk_1` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`fee_id`) ON DELETE CASCADE,
  CONSTRAINT `fee_assignments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `member` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `fees` (
  `fee_id` int NOT NULL AUTO_INCREMENT,
  `club_id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `deadline` date NOT NULL,
  `target` enum('all','partial') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fee_id`),
  KEY `club_id` (`club_id`),
  CONSTRAINT `fees_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `club` (`club_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `member` (
  `student_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `department` varchar(50) DEFAULT NULL,
  `grade` enum('一','二','三','四') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `emergency_contact_name` varchar(50) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `diet` enum('葷','素') DEFAULT NULL,
  `join_date` date NOT NULL,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `fee_id` int NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `paid_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `fee_id` (`fee_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`fee_id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `member` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `permission` (
  `club_id` varchar(10) NOT NULL,
  `role_id` int NOT NULL,
  `can_view_all_pages` tinyint(1) DEFAULT '0',
  `can_manage_member` tinyint(1) DEFAULT '0',
  `can_manage_asset` tinyint(1) DEFAULT '0',
  `can_manage_finance` tinyint(1) DEFAULT '0',
  `can_manage_permission` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`club_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `club` (`club_id`),
  CONSTRAINT `permission_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `club` (`club_id`, `club_name`) VALUES
('A001', '研究生學會');
INSERT INTO `club` (`club_id`, `club_name`) VALUES
('A002', '學生會');
INSERT INTO `club` (`club_id`, `club_name`) VALUES
('B001', '長廊詩社');
INSERT INTO `club` (`club_id`, `club_name`) VALUES
('B002', '演辯社'),
('B005', '電影社'),
('C004', '吉他社'),
('C005', '管樂團'),
('D005', '師大附中校友會'),
('D008', '松山高中校友會'),
('E001', '指南服務團'),
('E019', '國際志工社'),
('F008', '熱舞社'),
('F014', '網球社');

INSERT INTO `clubmember` (`student_id`, `club_id`, `role_id`, `join_semester`) VALUES
('110306001', 'C004', 5, '113-2');
INSERT INTO `clubmember` (`student_id`, `club_id`, `role_id`, `join_semester`) VALUES
('110306001', 'E019', 1, '113-2');
INSERT INTO `clubmember` (`student_id`, `club_id`, `role_id`, `join_semester`) VALUES
('110306001', 'F008', 5, '113-1');
INSERT INTO `clubmember` (`student_id`, `club_id`, `role_id`, `join_semester`) VALUES
('111306001', 'E019', 3, '113-2'),
('111306011', 'E019', 4, '113-2'),
('112306065', 'E019', 2, '113-2'),
('113306021', 'E019', 5, '113-2');

INSERT INTO `fee_assignments` (`fee_id`, `student_id`) VALUES
(2, '110306001');
INSERT INTO `fee_assignments` (`fee_id`, `student_id`) VALUES
(23, '110306001');
INSERT INTO `fee_assignments` (`fee_id`, `student_id`) VALUES
(22, '111306001');
INSERT INTO `fee_assignments` (`fee_id`, `student_id`) VALUES
(22, '111306011'),
(2, '112306065'),
(23, '112306065');

INSERT INTO `fees` (`fee_id`, `club_id`, `name`, `amount`, `deadline`, `target`, `created_at`) VALUES
(2, 'E019', '迎新晚會餐費', '300.00', '2025-05-30', 'partial', '2025-05-19 01:43:34');
INSERT INTO `fees` (`fee_id`, `club_id`, `name`, `amount`, `deadline`, `target`, `created_at`) VALUES
(3, 'E019', '113-1 社費', '500.00', '2025-05-31', 'all', '2025-05-19 03:47:25');
INSERT INTO `fees` (`fee_id`, `club_id`, `name`, `amount`, `deadline`, `target`, `created_at`) VALUES
(7, 'E019', '113-2 社費', '1000.00', '2025-06-30', 'all', '2025-05-19 03:53:51');
INSERT INTO `fees` (`fee_id`, `club_id`, `name`, `amount`, `deadline`, `target`, `created_at`) VALUES
(8, 'E019', '113-1 社費', '1000.00', '2025-07-09', 'all', '2025-05-19 03:56:05'),
(10, 'E019', '112-1 社費', '800.00', '2025-05-31', 'all', '2025-05-19 04:35:38'),
(13, 'C004', '113-1 社費', '700.00', '2024-10-10', 'all', '2025-05-19 05:30:59'),
(22, 'E019', 'aespa費用', '200.00', '2025-06-30', 'partial', '2025-05-19 15:10:59'),
(23, 'E019', 'BTS費用', '20000.00', '2025-05-24', 'partial', '2025-05-23 21:25:21');

INSERT INTO `member` (`student_id`, `name`, `department`, `grade`, `phone`, `email`, `password`, `emergency_contact_name`, `emergency_contact_phone`, `diet`, `join_date`) VALUES
('110306001', '田柾國', '資管系', '四', '0901901901', 'jungkook@example.com', '110306001', '媽媽', '0987654321', '葷', '2025-04-01');
INSERT INTO `member` (`student_id`, `name`, `department`, `grade`, `phone`, `email`, `password`, `emergency_contact_name`, `emergency_contact_phone`, `diet`, `join_date`) VALUES
('111306001', '劉知珉', '資管系', '三', '0900411411', 'karina@example.com', '111306001', '爸爸', '0911222333', '葷', '2025-05-01');
INSERT INTO `member` (`student_id`, `name`, `department`, `grade`, `phone`, `email`, `password`, `emergency_contact_name`, `emergency_contact_phone`, `diet`, `join_date`) VALUES
('111306011', '金冬天', '資管系', '三', '0901101101', 'winter@example.com', '111306011', '姊姊', '0922333444', '素', '2025-05-01');
INSERT INTO `member` (`student_id`, `name`, `department`, `grade`, `phone`, `email`, `password`, `emergency_contact_name`, `emergency_contact_phone`, `diet`, `join_date`) VALUES
('112306065', '李中中', '資管系', '二', '0910029884', 'erica@example.com', '112306065', '叔叔', '0977666555', '葷', '2025-04-01'),
('113306021', '金李涵', '資管系', '一', '0921021021', 'leehan@example.com', '113306021', '姑姑', '0966333444', '葷', '2025-05-02');

INSERT INTO `payments` (`payment_id`, `fee_id`, `student_id`, `paid_at`, `amount`) VALUES
(2, 7, '111306001', '2025-05-19 03:54:12', '1000.00');
INSERT INTO `payments` (`payment_id`, `fee_id`, `student_id`, `paid_at`, `amount`) VALUES
(3, 7, '111306011', '2025-05-19 03:54:12', '1000.00');
INSERT INTO `payments` (`payment_id`, `fee_id`, `student_id`, `paid_at`, `amount`) VALUES
(6, 8, '111306001', '2025-05-19 05:51:52', '1000.00');
INSERT INTO `payments` (`payment_id`, `fee_id`, `student_id`, `paid_at`, `amount`) VALUES
(7, 8, '113306021', '2025-05-19 05:51:52', '1000.00'),
(8, 22, '111306001', '2025-05-19 15:22:50', '200.00'),
(9, 10, '110306001', '2025-05-19 16:01:11', '800.00'),
(10, 10, '111306001', '2025-05-19 16:01:11', '800.00'),
(11, 10, '111306011', '2025-05-19 16:01:11', '800.00'),
(12, 10, '112306065', '2025-05-19 16:01:11', '800.00'),
(13, 10, '113306021', '2025-05-19 16:01:11', '800.00');

INSERT INTO `permission` (`club_id`, `role_id`, `can_view_all_pages`, `can_manage_member`, `can_manage_asset`, `can_manage_finance`, `can_manage_permission`) VALUES
('A001', 1, 1, 1, 1, 0, 1);
INSERT INTO `permission` (`club_id`, `role_id`, `can_view_all_pages`, `can_manage_member`, `can_manage_asset`, `can_manage_finance`, `can_manage_permission`) VALUES
('A001', 2, 1, 1, 0, 0, 1);
INSERT INTO `permission` (`club_id`, `role_id`, `can_view_all_pages`, `can_manage_member`, `can_manage_asset`, `can_manage_finance`, `can_manage_permission`) VALUES
('A001', 3, 1, 0, 0, 1, 0);
INSERT INTO `permission` (`club_id`, `role_id`, `can_view_all_pages`, `can_manage_member`, `can_manage_asset`, `can_manage_finance`, `can_manage_permission`) VALUES
('A001', 4, 1, 0, 1, 0, 0),
('A001', 5, 0, 0, 0, 0, 0),
('A002', 1, 1, 1, 1, 0, 1),
('A002', 2, 1, 1, 0, 0, 1),
('A002', 3, 1, 0, 0, 1, 0),
('A002', 4, 1, 0, 1, 0, 0),
('A002', 5, 0, 0, 0, 0, 0),
('B001', 1, 1, 1, 1, 0, 1),
('B001', 2, 1, 1, 0, 0, 1),
('B001', 3, 1, 0, 0, 1, 0),
('B001', 4, 1, 0, 1, 0, 0),
('B001', 5, 0, 0, 0, 0, 0),
('B002', 1, 1, 1, 1, 0, 1),
('B002', 2, 1, 1, 0, 0, 1),
('B002', 3, 1, 0, 0, 1, 0),
('B002', 4, 1, 0, 1, 0, 0),
('B002', 5, 0, 0, 0, 0, 0),
('B005', 1, 1, 1, 1, 0, 1),
('B005', 2, 1, 1, 0, 0, 1),
('B005', 3, 1, 0, 0, 1, 0),
('B005', 4, 1, 0, 1, 0, 0),
('B005', 5, 0, 0, 0, 0, 0),
('C004', 1, 1, 1, 1, 0, 1),
('C004', 2, 1, 1, 0, 0, 1),
('C004', 3, 1, 0, 0, 1, 0),
('C004', 4, 1, 0, 1, 0, 0),
('C004', 5, 0, 0, 0, 0, 0),
('C005', 1, 1, 1, 1, 0, 1),
('C005', 2, 1, 1, 0, 0, 1),
('C005', 3, 1, 0, 0, 1, 0),
('C005', 4, 1, 0, 1, 0, 0),
('C005', 5, 0, 0, 0, 0, 0),
('D005', 1, 1, 1, 1, 0, 1),
('D005', 2, 1, 1, 0, 0, 1),
('D005', 3, 1, 0, 0, 1, 0),
('D005', 4, 1, 0, 1, 0, 0),
('D005', 5, 0, 0, 0, 0, 0),
('D008', 1, 1, 1, 1, 0, 1),
('D008', 2, 1, 1, 0, 0, 1),
('D008', 3, 1, 0, 0, 1, 0),
('D008', 4, 1, 0, 1, 0, 0),
('D008', 5, 0, 0, 0, 0, 0),
('E001', 1, 1, 1, 1, 0, 1),
('E001', 2, 1, 1, 0, 0, 1),
('E001', 3, 1, 0, 0, 1, 0),
('E001', 4, 1, 0, 1, 0, 0),
('E001', 5, 0, 0, 0, 0, 0),
('E019', 1, 1, 1, 1, 0, 1),
('E019', 2, 1, 1, 0, 0, 1),
('E019', 3, 1, 0, 0, 1, 0),
('E019', 4, 1, 0, 1, 0, 0),
('E019', 5, 0, 0, 0, 0, 0),
('F008', 1, 1, 1, 1, 0, 1),
('F008', 2, 1, 1, 0, 0, 1),
('F008', 3, 1, 0, 0, 1, 0),
('F008', 4, 1, 0, 1, 0, 0),
('F008', 5, 0, 0, 0, 0, 0),
('F014', 1, 1, 1, 1, 0, 1),
('F014', 2, 1, 1, 0, 0, 1),
('F014', 3, 1, 0, 0, 1, 0),
('F014', 4, 1, 0, 1, 0, 0),
('F014', 5, 0, 0, 0, 0, 0);

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, '社長');
INSERT INTO `role` (`role_id`, `role_name`) VALUES
(2, '副社長');
INSERT INTO `role` (`role_id`, `role_name`) VALUES
(3, '總務');
INSERT INTO `role` (`role_id`, `role_name`) VALUES
(4, '器材'),
(5, '社員');

DROP TABLE IF EXISTS `asset_borrow_log`;
CREATE TABLE `asset_borrow_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `borrow_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `borrower` varchar(20) NOT NULL,
  `note` text,
  PRIMARY KEY (`log_id`),
  KEY `fk_borrower_member` (`borrower`),
  KEY `fk_borrowed_item` (`item_id`),
  CONSTRAINT `fk_borrowed_item` FOREIGN KEY (`item_id`) REFERENCES `asset_item` (`item_id`),
  CONSTRAINT `fk_borrower_member` FOREIGN KEY (`borrower`) REFERENCES `member` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `asset_item`;
CREATE TABLE `asset_item` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` enum('可借用','不可借用') DEFAULT '可借用',
  `purchase_date` date DEFAULT NULL,
  `purchaser` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `note` text,
  `club_id` varchar(10) NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `fk_asset_club` (`club_id`),
  CONSTRAINT `fk_asset_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`club_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `asset_item` (`item_id`, `item_name`, `location`, `status`, `purchase_date`, `purchaser`, `price`, `note`, `club_id`) VALUES
(1, '投影機', '社辦櫃子1', '可借用', '2023-01-15', '田柾國', 12000.00, '高畫質', 'E019'),
(2, '折疊桌', '倉庫左側', '可借用', '2022-12-05', '田柾國', 1500.00, '有點刮痕', 'E019'),
(3, '延長線', '工具箱', '可借用', '2023-02-20', '劉知珉', 300.00, '', 'E019'),
(4, '音響', '社辦角落', '可借用', '2023-03-12', '金冬天', 5600.00, '含藍牙功能', 'E019'),
(5, '打氣筒', '倉庫中層', '可借用', '2023-05-01', '李中中', 500.00, '', 'E019'),
(6, '煮水壺', '社辦櫃子2', '可借用', '2023-06-11', '金李涵', 850.00, '保溫效果不錯', 'E019'),
(7, '布條', '活動道具箱', '可借用', '2022-10-20', '劉知珉', 1200.00, '去年社博用', 'E019'),
(8, '帳篷', '倉庫頂層', '可借用', '2023-04-15', '田柾國', 3500.00, '可遮陽防雨', 'E019'),
(9, '小白板', '社辦門後', '可借用', '2022-09-10', '金冬天', 400.00, '', 'E019'),
(10, '急救包', '社辦抽屜', '可借用', '2023-07-01', '李中中', 900.00, '完整無缺', 'E019');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
