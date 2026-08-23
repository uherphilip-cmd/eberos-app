$appDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $appDirectory '.eberos-server.pid'

if (Test-Path -LiteralPath $pidFile) {
    $savedPid = [int](Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue)
    if ($savedPid) {
        Stop-Process -Id $savedPid -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
}

Write-Host 'Der lokale Eberos-App-Server wurde beendet.'

