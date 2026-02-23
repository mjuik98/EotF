param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^V\d+$')]
  [string]$From,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^V\d+$')]
  [string]$To
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$oldFile = "echo-of-the-fallen$From.html"
$newFile = "echo-of-the-fallen$To.html"

if (!(Test-Path -LiteralPath $oldFile)) {
  throw "Source file not found: $oldFile"
}
if (Test-Path -LiteralPath $newFile) {
  throw "Target file already exists: $newFile"
}

Move-Item -LiteralPath $oldFile -Destination $newFile

$content = Get-Content -LiteralPath $newFile -Raw -Encoding UTF8
$toLower = $To.ToLowerInvariant()

# 1) Header comment version
$content = [regex]::Replace(
  $content,
  '(?m)(//\s+ECHO OF THE FALLEN\s+)v\d+',
  ('$1' + $toLower),
  1
)

# 2) BUILD_META.version single source of truth
$content = [regex]::Replace(
  $content,
  "version:\s*'v\d+'",
  ("version: '" + $toLower + "'"),
  1
)

[System.IO.File]::WriteAllText(
  (Resolve-Path -LiteralPath $newFile),
  $content,
  (New-Object System.Text.UTF8Encoding($false))
)

Write-Host "Version bump completed: $oldFile -> $newFile (version: $toLower)"
