Param(
    [string]$LastOctet,
    [string]$Port
)

if (-not $LastOctet) {
    $LastOctet = Read-Host "Enter the last octet of the device IP (e.g, 192.168.100.xx)"
}

if (-not $Port) {
    $Port = Read-Host "Enter the ADB port (press Enter for default 5555)"
}

if ([string]::IsNullOrWhiteSpace($Port)) {
    $Port = "5555"
}

$ip = "192.168.100.$LastOctet"
Write-Host "Connecting to ${ip}:${Port}"
adb connect ("{0}:{1}" -f $ip, $Port)

if ($LASTEXITCODE -eq 0) {
    Write-Host "ADB connection successful. Starting app..."
    Push-Location (Join-Path $PSScriptRoot "..")
    try {
        npm run android
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Error "ADB connection failed with exit code $LASTEXITCODE. Skipping npm script."
}