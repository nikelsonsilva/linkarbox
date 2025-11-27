@echo off
setlocal
set "source=%~dp0"
set "source=%source:~0,-1%"
set "timestamp=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%"
set "timestamp=%timestamp: =0%"
set "destination=%source%_backup_%timestamp%"

echo Criando backup de:
echo %source%
echo.
echo Para:
echo %destination%
echo.
echo Copiando arquivos... (isso pode demorar um pouco devido ao node_modules)
xcopy "%source%" "%destination%" /E /I /H /Y /Exclude:exclude_backup.txt

echo.
echo Backup concluido com sucesso!
