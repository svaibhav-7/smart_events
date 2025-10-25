# Kill any process using port 5000
$processes = netstat -ano | Select-String ":5000 "
if ($processes) {
    $processes | ForEach-Object {
        $parts = $_ -split '\s+'
        $pid = $parts[-1]
        if ($pid -and $pid -ne "0") {
            Write-Host "Killing process $pid using port 5000..."
            taskkill /PID $pid /F
        }
    }
}

# Kill any existing node processes related to this project
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Where-Object { $_.Path -like "*smart_events*" } | ForEach-Object {
        Write-Host "Killing Node process $($_.Id)..."
        taskkill /PID $_.Id /F
    }
}

Write-Host "Starting server..."
npm run dev
