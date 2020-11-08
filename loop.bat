echo on
echo loop??
set n=0
:loop
echo %n%
start /min cmd /c forever start -c node .\src\upPdf\registrarE%n%.js
set /a n+=1
if %n% LSS 8 GOTO loop