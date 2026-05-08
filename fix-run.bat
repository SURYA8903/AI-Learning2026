@echo off
echo [ADZ FIX] Attempting to fix NVM path for this session...
set "NVM_HOME=C:\Users\%USERNAME%\AppData\Local\nvm"
set "NVM_SYMLINK=C:\nvm4w\nodejs"
echo [ADZ FIX] Running server directly...
".\node_modules\.bin\tsx" server.ts
pause
