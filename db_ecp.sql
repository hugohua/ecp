-- phpMyAdmin SQL Dump
-- version 3.5.3
-- http://www.phpmyadmin.net
--
-- 主机: localhost
-- 生成日期: 2014 年 07 月 09 日 11:08
-- 服务器版本: 5.0.26-log
-- PHP 版本: 5.3.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `db_ecp`
--

-- --------------------------------------------------------

--
-- 表的结构 `tb_attribute`
--

DROP TABLE IF EXISTS `tb_attribute`;
CREATE TABLE IF NOT EXISTS `tb_attribute` (
  `att_id` int(11) NOT NULL auto_increment COMMENT '属性ID自增',
  `att_require_id` int(11) NOT NULL COMMENT '需求ID',
  `att_text` int(11) default NULL COMMENT '属性值 (数量)',
  `attr_type_id` int(11) NOT NULL COMMENT '需求类型ID',
  `att_rank_id` int(11) NOT NULL COMMENT '需求归档ID',
  `att_cp_id` int(11) default NULL COMMENT 'CP ID',
  `att_price` float default NULL COMMENT '需求价格',
  `att_is_parent` int(2) NOT NULL default '0' COMMENT '需求属性类型，0表示 配套类型，1表示正常需求，2表示配套广告数',
  `att_is_del` tinyint(4) default '0' COMMENT '是否删除需求。已删除是1，未删除是0',
  PRIMARY KEY  (`att_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求附属 属性表' AUTO_INCREMENT=28816 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_attribute_bak`
--

DROP TABLE IF EXISTS `tb_attribute_bak`;
CREATE TABLE IF NOT EXISTS `tb_attribute_bak` (
  `att_id` int(11) NOT NULL auto_increment COMMENT '属性ID自增',
  `att_require_id` int(11) NOT NULL COMMENT '需求ID',
  `att_text` int(11) default NULL COMMENT '属性值 (数量)',
  `attr_type_id` int(11) NOT NULL COMMENT '需求类型ID',
  `att_rank_id` int(11) NOT NULL COMMENT '需求归档ID',
  `att_cp_id` int(11) default NULL COMMENT 'CP ID',
  `att_price` float default NULL COMMENT '需求价格',
  `att_is_parent` int(2) NOT NULL default '0' COMMENT '需求属性类型，0表示 配套类型，1表示正常需求，2表示配套广告数',
  PRIMARY KEY  (`att_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求附属 属性表' AUTO_INCREMENT=22215 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_cp`
--

DROP TABLE IF EXISTS `tb_cp`;
CREATE TABLE IF NOT EXISTS `tb_cp` (
  `cp_id` int(11) NOT NULL auto_increment COMMENT 'CP ID',
  `cp_name` varchar(200) NOT NULL COMMENT 'CP名称',
  `cp_phone` varchar(20) default NULL COMMENT 'CP 电话',
  `cp_email` varchar(255) default NULL COMMENT 'CP的email',
  `cp_qq` varchar(20) default NULL COMMENT 'CP QQ',
  `cp_city` varchar(200) default NULL COMMENT 'CP所在地',
  `cp_contract` varchar(200) default NULL COMMENT '合同编号',
  `cp_company` varchar(100) default NULL COMMENT '派驻设计师所属的外包公司',
  `cp_contract_link` varchar(250) default NULL COMMENT '合同链接',
  `cp_type` int(11) NOT NULL default '0' COMMENT '是否为外派设计师，1表示是，0表示不是',
  `cp_rank_id` int(11) NOT NULL COMMENT '外派设计师归属的业务部门',
  `cp_state` int(11) NOT NULL default '1' COMMENT 'CP状态,：1是显示，0是隐藏',
  PRIMARY KEY  (`cp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='CP供应商' AUTO_INCREMENT=23 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_email`
--

DROP TABLE IF EXISTS `tb_email`;
CREATE TABLE IF NOT EXISTS `tb_email` (
  `email_id` int(11) NOT NULL COMMENT '发送Email id',
  `email_num` int(11) NOT NULL default '0' COMMENT '当天是否发送了Email',
  `email_date` date NOT NULL COMMENT '发送email日期'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='发送email记录';

-- --------------------------------------------------------

--
-- 表的结构 `tb_price`
--

DROP TABLE IF EXISTS `tb_price`;
CREATE TABLE IF NOT EXISTS `tb_price` (
  `price_id` int(11) NOT NULL auto_increment,
  `price_type_id` int(11) default NULL COMMENT '该价格对于的需求类型ID',
  `price_cp_id` int(11) default NULL,
  `price_cp_type` int(11) NOT NULL default '0' COMMENT '是否为外派设计师，1表示是，0表示不是',
  `price_name` int(11) default '0' COMMENT '价格',
  `price_rating` varchar(10) default NULL COMMENT '需求归档分数',
  `price_month` date NOT NULL COMMENT '按月份计算价格',
  PRIMARY KEY  (`price_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='CP价格表' AUTO_INCREMENT=6849 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_price_edit`
--

DROP TABLE IF EXISTS `tb_price_edit`;
CREATE TABLE IF NOT EXISTS `tb_price_edit` (
  `edit_id` int(11) NOT NULL auto_increment,
  `edit_cp_id` int(11) NOT NULL COMMENT 'CP id',
  `edit_type_id` int(11) NOT NULL COMMENT '需求类型ID',
  `edit_old_price` int(11) NOT NULL COMMENT '原修改价格',
  `edit_new_price` int(11) NOT NULL COMMENT '调整后的价格',
  `edit_price_type` varchar(10) NOT NULL COMMENT 'ABC等级，不分等级的默认是B，固定价格的 默认是H',
  `edit_check` tinyint(4) NOT NULL default '0' COMMENT '财务是否审核，0为未审核，1为审核通过',
  `edit_date` date NOT NULL COMMENT '调整日期，从几号起算',
  `edit_add_date` date NOT NULL COMMENT '调整添加日期，系统自动生成',
  `edit_confirm_date` datetime default NULL COMMENT '财务审核时间',
  `edit_confirm_user` varchar(10) default NULL COMMENT '财务审核人',
  PRIMARY KEY  (`edit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_rank`
--

DROP TABLE IF EXISTS `tb_rank`;
CREATE TABLE IF NOT EXISTS `tb_rank` (
  `rank_id` int(11) NOT NULL auto_increment COMMENT '归类ID',
  `rank_name` varchar(200) NOT NULL COMMENT '归类名称',
  `rank_designer` text COMMENT '审核设计师',
  `rank_wb` text COMMENT '审核前端',
  `rank_group` varchar(200) default NULL COMMENT '需求所对应的运营组',
  `rank_state` int(11) NOT NULL default '1' COMMENT '归类状态，1是显示，0是不显示',
  `rank_short` varchar(10) default NULL COMMENT '需求归类缩写',
  `rank_sort` int(4) default '500' COMMENT '排序字段',
  PRIMARY KEY  (`rank_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求归类' AUTO_INCREMENT=16 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_rank_cate`
--

DROP TABLE IF EXISTS `tb_rank_cate`;
CREATE TABLE IF NOT EXISTS `tb_rank_cate` (
  `rank_cate_id` int(11) NOT NULL auto_increment COMMENT 'ID',
  `rank_id` int(11) NOT NULL COMMENT 'tb_rank表关联',
  `rank_cate_name` varchar(200) NOT NULL COMMENT '分类名称',
  `rank_cate_state` tinyint(4) NOT NULL default '1' COMMENT '分类状态 1是显示，0是隐藏',
  PRIMARY KEY  (`rank_cate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=121 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_require`
--

DROP TABLE IF EXISTS `tb_require`;
CREATE TABLE IF NOT EXISTS `tb_require` (
  `require_id` int(11) NOT NULL auto_increment COMMENT '需求ID',
  `require_name` varchar(200) NOT NULL COMMENT '需求名称',
  `require_rank_id` int(11) default NULL COMMENT '需求归类',
  `require_rank_cate_id` int(11) default '0' COMMENT 'rank id下的细分归类',
  `require_type_id` int(11) default NULL COMMENT '需求类型',
  `require_ads` int(11) default NULL COMMENT '配置广告数',
  `require_workload` float default '0' COMMENT '工作量',
  `require_start_date` date default NULL COMMENT '需求开始时间',
  `require_finish_date` date default NULL COMMENT '需求结束时间',
  `require_demand` text COMMENT '设计要求',
  `require_remarks` text COMMENT '备注',
  `require_state` int(11) default '1' COMMENT '需求状态',
  `require_creator` varchar(200) NOT NULL COMMENT '需求创建者',
  `require_cp_id` int(11) default NULL COMMENT '需求CP ID',
  `require_verify_user` varchar(200) default NULL COMMENT '设计审核人',
  `require_verify_dev` varchar(200) default NULL COMMENT '审核前端',
  `require_mark_pdm` int(4) default '0' COMMENT '产品经理分数（打分）',
  `require_mark_desgin` int(4) default '0' COMMENT '设计师打分',
  `require_mark_avg` int(11) default '0' COMMENT '打分 平均分',
  `require_rating_pdm` varchar(200) default NULL COMMENT '产品经理首次打分归档',
  `require_rating` varchar(200) default NULL COMMENT '打分 评级',
  `require_check` varchar(255) default NULL COMMENT '考核',
  `require_pdm_comment` text,
  `require_desgin_comment` text,
  `require_attachment` text COMMENT '需求附件',
  `require_desgin_attachment` text COMMENT '设计稿附件',
  `require_base_cost` float default '0' COMMENT '基础费用',
  `require_pm_cost` float default '0' COMMENT '项目经理手动调价',
  `require_pm_cost_change` int(4) default '1' COMMENT '1是增, 0是减',
  `require_final_cost` float default '0' COMMENT '最终价格',
  `require_cost_comment` text NOT NULL COMMENT '价格修改说明',
  `require_type` int(2) NOT NULL default '1' COMMENT '需求类型，1是正常需求，0是临时需求',
  `is_email` varchar(100) default NULL COMMENT '是否已发邮件，默认是NULL未发，存在值说明是已发',
  `is_modify_attr` int(2) NOT NULL default '1' COMMENT '待评分时，是否修改过配置信息',
  `is_turn_require` tinyint(4) NOT NULL default '0' COMMENT '判断需求是否驳回 0是没有被驳回过，1是曾经被驳回过',
  `is_del` tinyint(4) default '0' COMMENT '是否删除需求。已删除是1，未删除是0',
  `require_del_user` varchar(200) default NULL COMMENT '删除需求的用户',
  `require_add_time` datetime default NULL COMMENT '需求新增时间',
  PRIMARY KEY  (`require_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求表' AUTO_INCREMENT=13323 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_require_bak`
--

DROP TABLE IF EXISTS `tb_require_bak`;
CREATE TABLE IF NOT EXISTS `tb_require_bak` (
  `require_id` int(11) NOT NULL auto_increment COMMENT '需求ID',
  `require_name` varchar(200) NOT NULL COMMENT '需求名称',
  `require_rank_id` int(11) default NULL COMMENT '需求归类',
  `require_rank_cate_id` int(11) default '0' COMMENT 'rank id下的细分归类',
  `require_type_id` int(11) default NULL COMMENT '需求类型',
  `require_ads` int(11) default NULL COMMENT '配置广告数',
  `require_workload` float default '0' COMMENT '工作量',
  `require_start_date` date default NULL COMMENT '需求开始时间',
  `require_finish_date` date default NULL COMMENT '需求结束时间',
  `require_demand` text COMMENT '设计要求',
  `require_remarks` text COMMENT '备注',
  `require_state` int(11) default '1' COMMENT '需求状态',
  `require_creator` varchar(200) NOT NULL COMMENT '需求创建者',
  `require_cp_id` int(11) default NULL COMMENT '需求CP ID',
  `require_verify_user` varchar(200) default NULL COMMENT '设计审核人',
  `require_verify_dev` varchar(200) default NULL COMMENT '审核前端',
  `require_mark_pdm` int(4) default '0' COMMENT '产品经理分数（打分）',
  `require_mark_desgin` int(4) default '0' COMMENT '设计师打分',
  `require_mark_avg` int(11) default '0' COMMENT '打分 平均分',
  `require_rating_pdm` varchar(200) default NULL COMMENT '产品经理首次打分归档',
  `require_rating` varchar(200) default NULL COMMENT '打分 评级',
  `require_check` varchar(255) default NULL COMMENT '考核',
  `require_pdm_comment` text,
  `require_desgin_comment` text,
  `require_attachment` text COMMENT '需求附件',
  `require_desgin_attachment` text COMMENT '设计稿附件',
  `require_base_cost` float default '0' COMMENT '基础费用',
  `require_pm_cost` float default '0' COMMENT '项目经理手动调价',
  `require_pm_cost_change` int(4) default '1' COMMENT '1是增, 0是减',
  `require_final_cost` float default '0' COMMENT '最终价格',
  `require_cost_comment` text NOT NULL COMMENT '价格修改说明',
  `require_type` int(2) NOT NULL default '1' COMMENT '需求类型，1是正常需求，0是临时需求',
  `is_email` varchar(100) default NULL COMMENT '是否已发邮件，默认是NULL未发，存在值说明是已发',
  `is_modify_attr` int(2) NOT NULL default '1' COMMENT '待评分时，是否修改过配置信息',
  `is_turn_require` tinyint(4) NOT NULL default '0' COMMENT '判断需求是否驳回 0是没有被驳回过，1是曾经被驳回过',
  `is_del` tinyint(4) default '0' COMMENT '是否删除需求。已删除是1，未删除是0',
  `require_del_user` varchar(200) default NULL COMMENT '删除需求的用户',
  `require_add_time` datetime default NULL COMMENT '需求添加事件',
  PRIMARY KEY  (`require_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求表' AUTO_INCREMENT=13319 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_type`
--

DROP TABLE IF EXISTS `tb_type`;
CREATE TABLE IF NOT EXISTS `tb_type` (
  `type_id` int(11) NOT NULL auto_increment COMMENT '需求类型ID',
  `type_name` varchar(200) NOT NULL COMMENT '需求类型名称',
  `type_check` int(2) default '0' COMMENT '需求类型是否需要评分，1表示需要，0表示不需要。默认是0',
  `type_show_num` int(2) NOT NULL default '0' COMMENT '是否显示数量，0是不显示，1是显示',
  `type_state` int(2) NOT NULL default '1' COMMENT '需求类型状态：1是显示，0是隐藏',
  `type_sort` int(11) default '500' COMMENT '排序',
  PRIMARY KEY  (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求类型' AUTO_INCREMENT=28 ;

-- --------------------------------------------------------

--
-- 表的结构 `tb_users`
--

DROP TABLE IF EXISTS `tb_users`;
CREATE TABLE IF NOT EXISTS `tb_users` (
  `id` int(11) NOT NULL auto_increment COMMENT 'id',
  `user_id` int(11) default NULL COMMENT '用户ID',
  `login_name` varchar(255) default NULL,
  `english_name` varchar(255) default NULL,
  `chinese_name` varchar(255) default NULL,
  `full_name` varchar(255) default NULL,
  `gender` varchar(255) default NULL,
  `id_card_number` int(11) default '0',
  `department_id` int(11) default NULL,
  `department_name` varchar(255) default NULL,
  `group_id` int(11) default NULL,
  `group_name` varchar(255) default NULL,
  `user_power` int(11) NOT NULL default '1',
  `user_power_rank` varchar(200) default '0' COMMENT '用户管理权限，用于管理需求归档',
  `user_state` int(11) NOT NULL default '1',
  `user_password` varchar(255) default NULL COMMENT '用户密码',
  `user_qq` varchar(12) default NULL COMMENT '用户QQ',
  `user_phone` varchar(30) default NULL COMMENT '用户电话',
  `user_email` varchar(200) default NULL COMMENT '用户邮箱',
  `user_first_login` datetime default NULL COMMENT '用户第一次登录系统',
  `user_last_login` datetime default NULL COMMENT '用户最后一次登录系统',
  `user_login_time` int(11) NOT NULL default '0' COMMENT '用户登录次数',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `login_name` (`login_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=772 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
