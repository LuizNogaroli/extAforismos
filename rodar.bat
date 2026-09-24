@echo off
REM ========================================
REM  extAforismos — Dev Server (localhost)
REM  Inicia servidor HTTP na porta 8000
REM ========================================

title extAforismos - Dev Server
color 0A

echo.
echo ╔════════════════════════════════════════╗
echo ║   extAforismos - Servidor Local       ║
echo ╚════════════════════════════════════════╝
echo.

REM Detecta se estamos no diretório certo
if not exist "index.html" (
    echo [ERRO] index.html nao encontrado!
    echo Este script deve ser executado na pasta raiz de extAforismos.
    pause
    exit /b 1
)

REM Tenta Python 3 primeiro
where python >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Python encontrado
    echo.
    echo Iniciando servidor em http://localhost:8000
    echo.
    echo Pressione Ctrl+C para parar o servidor.
    echo.

    REM Aguarda um segundo antes de abrir o navegador
    timeout /t 1 /nobreak >nul

    REM Abre o navegador
    start http://localhost:8000/index.html

    REM Inicia o servidor
    python -m http.server 8000 --bind 127.0.0.1
    exit /b 0
)

REM Tenta Python 2 (fallback)
where python2 >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Python 2 encontrado
    echo.
    echo Iniciando servidor em http://localhost:8000
    echo.
    echo Pressione Ctrl+C para parar o servidor.
    echo.

    timeout /t 1 /nobreak >nul
    start http://localhost:8000/index.html

    python2 -m SimpleHTTPServer 8000
    exit /b 0
)

REM Tenta py (Windows Python Launcher)
where py >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Python Launcher encontrado
    echo.
    echo Iniciando servidor em http://localhost:8000
    echo.
    echo Pressione Ctrl+C para parar o servidor.
    echo.

    timeout /t 1 /nobreak >nul
    start http://localhost:8000/index.html

    py -3 -m http.server 8000 --bind 127.0.0.1
    exit /b 0
)

REM Tenta Node.js (se Python não disponível)
where node >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Node.js encontrado
    echo.

    REM Cria um servidor simples em Node.js se necessário
    if not exist "server.js" (
        echo Criando servidor.js temporario...
        (
            echo const http = require('http'^);
            echo const fs = require('fs'^);
            echo const path = require('path'^);
            echo.
            echo const PORT = 8000;
            echo const HOST = '127.0.0.1';
            echo.
            echo const server = http.createServer((req, res^) =^> {
            echo   let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url^);
            echo.
            echo   fs.readFile(filePath, (err, content^) =^> {
            echo     if (err^) {
            echo       res.writeHead(404^);
            echo       res.end('404 - Arquivo não encontrado'^);
            echo       return;
            echo     }
            echo.
            echo     let contentType = 'text/html';
            echo     if (filePath.endsWith('.js'^)^) contentType = 'application/javascript';
            echo     if (filePath.endsWith('.css'^)^) contentType = 'text/css';
            echo     if (filePath.endsWith('.json'^)^) contentType = 'application/json';
            echo.
            echo     res.writeHead(200, { 'Content-Type': contentType }^);
            echo     res.end(content^);
            echo   }^);
            echo }^);
            echo.
            echo server.listen(PORT, HOST, (^) =^> {
            echo   console.log(`Servidor rodando em http://${HOST}:${PORT}`^);
            echo }^);
            echo.
            echo process.on('SIGINT', (^) =^> {
            echo   console.log('Servidor parado.'^);
            echo   process.exit(0^);
            echo }^);
        ) > server.js
    )

    echo Iniciando servidor em http://localhost:8000
    echo.
    echo Pressione Ctrl+C para parar o servidor.
    echo.

    timeout /t 1 /nobreak >nul
    start http://localhost:8000/index.html

    node server.js
    exit /b 0
)

REM Se nada foi encontrado
echo.
echo [ERRO] Nenhum runtime encontrado!
echo.
echo Para rodar o servidor, instale um dos seguintes:
echo   - Python 3 ou 2: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
echo Apos instalar, execute este arquivo novamente.
echo.
pause
exit /b 1
