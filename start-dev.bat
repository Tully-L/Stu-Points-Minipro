@echo off
echo Starting development server...

REM 检查是否安装了 http-server
where http-server >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing http-server...
    npm install -g http-server
)

REM 设置端口号
set PORT=3001

:try_port
REM 检查端口占用
echo Checking port %PORT%...
netstat -ano | findstr :%PORT% > nul
if %errorlevel% equ 0 (
    echo Port %PORT% is in use, trying next port...
    set /a PORT+=1
    goto try_port
)

REM 启动开发服务器
echo Starting server on port %PORT%...
echo Access URLs:
echo Local: http://localhost:%PORT%/points/
for /f "tokens=2 delims=[]" %%a in ('ping -n 1 -4 %computername% ^| findstr "["') do echo Network: http://%%a:%PORT%/points/
echo.

REM 检查 points 目录是否存在
if not exist points\ (
    echo Error: points directory not found!
    echo Please make sure all files are in the points directory.
    pause
    exit /b 1
)

cd points
http-server . -p %PORT% -c-1 --cors 