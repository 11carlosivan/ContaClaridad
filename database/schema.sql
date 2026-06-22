CREATE DATABASE IF NOT EXISTS `contaclaridad_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `contaclaridad_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `is_subscribed` BOOLEAN DEFAULT FALSE,
  `is_admin` BOOLEAN DEFAULT FALSE,
  `currency` VARCHAR(10) DEFAULT 'DOP',
  `trial_ends_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `record_type` ENUM('ingreso', 'costo', 'gasto') NOT NULL,
  `concept` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `quantity` INT DEFAULT NULL,
  `unit_price` DECIMAL(15, 2) DEFAULT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(100) PRIMARY KEY,
  `key_value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `settings` (`key_name`, `key_value`) VALUES ('paypal_client_id', 'AUH4GxzTnXUfys8Vdj1i3GRrYtw9e4Sq43mTlWRhwWqr9IbTi9x7BM6h3HtJHigWm6sdGcfw9iU4bT85');
INSERT IGNORE INTO `settings` (`key_name`, `key_value`) VALUES ('plan_price', '27');
INSERT IGNORE INTO `settings` (`key_name`, `key_value`) VALUES ('trial_duration_days', '7');

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `paypal_order_id` VARCHAR(100) UNIQUE NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
