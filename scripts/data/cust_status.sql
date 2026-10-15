CREATE TABLE IF NOT EXISTS `cust_status` (
  `cli_abbr` varchar(32) NOT NULL,
  `status` varchar(32) NOT NULL,
  `sort_no` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`cli_abbr`, `status`),
  KEY `idx_cust_status_cli_abbr` (`cli_abbr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户状态目录（按 cli_abbr）';
