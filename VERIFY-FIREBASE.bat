@echo off
cd /d %~dp0
node verify.js || exit /b 1
call npx firebase-tools use
call npx firebase-tools deploy --only firestore:rules
echo DONE - hard refresh all browsers with Ctrl+Shift+R
pause
