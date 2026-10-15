CREATE TABLE IF NOT EXISTS `cust_label` (
  `cli_abbr` varchar(32) NOT NULL,
  `label` varchar(64) NOT NULL,
  `color` varchar(16) NOT NULL DEFAULT '#1976d2',
  PRIMARY KEY (`cli_abbr`, `label`),
  KEY `idx_cust_label_cli_abbr` (`cli_abbr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户标签目录（按 cli_abbr 去重）';
