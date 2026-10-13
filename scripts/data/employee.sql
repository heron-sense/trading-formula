CREATE TABLE IF NOT EXISTS `employee` (
  `id` varchar(64) NOT NULL,
  `company_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL DEFAULT '',
  `name` varchar(64) NOT NULL,
  `email` varchar(128) NOT NULL DEFAULT '',
  `phone` varchar(32) NOT NULL DEFAULT '',
  `title` varchar(64) NOT NULL DEFAULT '',
  `department` varchar(64) NOT NULL DEFAULT '',
  `status` varchar(16) NOT NULL DEFAULT 'active' COMMENT 'active | inactive | pending',
  `hired_at` varchar(32) NOT NULL DEFAULT '',
  `avatar` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_employee_company_id` (`company_id`),
  KEY `idx_employee_user_id` (`user_id`),
  KEY `idx_employee_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公司员工';
