# PowerShell script to create code zip file excluding processed datasets
# Run this script from the project root directory

$excludePatterns = @(
    "data\processed\*",
    "__pycache__\*",
    "*.pyc",
    "shap_plots\*",
    "results\checkpoint-*\*",
    ".git\*",
    "node_modules\*",
    ".next\*"
)

$filesToInclude = @(
    "Model\src\Transformer_model\*.py",
    "Model\src\Transformer_model\requirements.txt",
    "Model\src\Transformer_model\app\**\*.py",
    "frontend\**\*.tsx",
    "frontend\**\*.ts",
    "frontend\**\*.json",
    "README.md",
    "requirements.txt",
    "*.md"
)

Write-Host "Creating code zip file (excluding processed datasets)..."

# Create temporary directory for files to zip
$tempDir = "temp_zip_content"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy Model directory (excluding processed data)
if (Test-Path "Model") {
    Copy-Item -Path "Model" -Destination "$tempDir\Model" -Recurse -Exclude $excludePatterns
}

# Copy frontend directory
if (Test-Path "frontend") {
    Copy-Item -Path "frontend" -Destination "$tempDir\frontend" -Recurse -Exclude $excludePatterns
}

# Copy root files
Copy-Item -Path "README.md" -Destination "$tempDir\" -ErrorAction SilentlyContinue
Copy-Item -Path "requirements.txt" -Destination "$tempDir\" -ErrorAction SilentlyContinue

# Create zip file
$zipFile = "MoleculeX-Predictive-Code.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "Zip file created: $zipFile"
Write-Host "Note: Processed datasets have been excluded as requested."


