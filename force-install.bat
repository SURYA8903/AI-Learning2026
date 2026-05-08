@echo off
set "APPDATA=C:\Users\shrey\AppData\Roaming"
set "LOCALAPPDATA=C:\Users\shrey\AppData\Local"
set "USERPROFILE=C:\Users\shrey"
set "HOMEPATH=\Users\shrey"
set "HOMEDRIVE=C:"
set "NVM_HOME=C:\Users\shrey\AppData\Local\nvm"
set "NVM_SYMLINK=C:\nvm4w\nodejs"
echo [ADZ FIX] Force installing dependencies...
npm install --prefix . --cache ./.npm-cache --no-audit --no-fund
pause
