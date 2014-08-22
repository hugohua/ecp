@echo off & title 京东内部系统HOST配置
echo 请按任意键执行此配置……
pause>nul
set hostfilepath="%systemroot%\System32\drivers\etc\hosts"
echo. >>%hostfilepath%
echo 121.14.96.189 ecp.jd.me >>%hostfilepath%
echo 配置完毕！请按回车键退出……
pause>nul