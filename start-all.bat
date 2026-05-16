@echo off
rem Inicia backend y frontend en ventanas separadas
cd /d "%~dp0backend"
start "Nutricare Backend" cmd /k "npm install && npm run dev"
cd /d "%~dp0frontend"
start "Nutricare Frontend" cmd /k "npm install && npm run dev"
echo Backend y frontend iniciados en nuevas ventanas.
echo Cierra estas ventanas solo cuando quieras detener los servidores.
pause
