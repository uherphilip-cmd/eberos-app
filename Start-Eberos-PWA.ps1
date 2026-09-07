$ErrorActionPreference = 'Stop'
$appDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $appDirectory '.eberos-server.pid'
$port = 8787
$url = "http://localhost:$port/eberos-charakter-builder.html"

if (Test-Path -LiteralPath $pidFile) {
    $savedPid = [int](Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue)
    if ($savedPid -and (Get-Process -Id $savedPid -ErrorAction SilentlyContinue)) {
        Start-Process $url
        exit 0
    }
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
}

$python = Get-Command py -ErrorAction SilentlyContinue
$arguments = @('-m', 'http.server', "$port", '--bind', '127.0.0.1', '--directory', $appDirectory)
if ($python) {
    $arguments = @('-3') + $arguments
} else {
    $python = Get-Command python -ErrorAction SilentlyContinue
}

if (-not $python) {
    Write-Host 'Python wurde nicht gefunden.' -ForegroundColor Red
    Write-Host 'Alternativ kann dieser Ordner auf einem HTTPS-Webserver veröffentlicht werden.'
    exit 1
}

$server = Start-Process -FilePath $python.Source -ArgumentList $arguments -WindowStyle Hidden -PassThru
Set-Content -LiteralPath $pidFile -Value $server.Id -Encoding ASCII

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 200
    }
}

if (-not $ready) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    Write-Host 'Der lokale App-Server konnte nicht gestartet werden.' -ForegroundColor Red
    exit 1
}

Start-Process $url
Write-Host 'Eberos v1.7.11 wurde im Browser geöffnet.' -ForegroundColor Green
Write-Host 'Dort im Browsermenü "App installieren" auswählen.'
