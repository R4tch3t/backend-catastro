echo off
echo Inicializando puertos...
start /min cmd /c forever stopall
start /min cmd /c forever start -c node .\src\actualizarP.js
start /min cmd /c forever start -c node .\src\actualizarU.js
start /min cmd /c forever start -c node .\src\allPadrones.js
start /min cmd /c forever start -c node .\src\comprobarU.js
start /min cmd /c forever start -c node .\src\getAvatar.js
start /min cmd /c forever start -c node .\src\obtenerOF.js
start /min cmd /c forever start -c node .\src\obtenerZ.js
start /min cmd /c forever start -c node .\src\padrones.js
start /min cmd /c forever start -c node .\src\predial.js
start /min cmd /c forever start -c node .\src\registrarC.js
start /min cmd /c forever start -c node .\src\registrarO.js
start /min cmd /c forever start -c node .\src\registrarU.js
start /min cmd /c forever start -c node .\src\saveDataL.js
start /min cmd /c forever start -c node .\src\informeM.js
start /min cmd /c forever start -c node .\src\actualizarC.js
start /min cmd /c forever start -c node .\src\registrarF.js