# --- CONFIG ---
$Date = Get-Date -Format "yyyyMMdd"
$BackupDir = "backup-$Date"
$ZipDir = "C:\path\to\unzipped\beverage-advanced-ai-app"

# --- Step 1: Backup ---
Write-Host "📦 Creating backup in $BackupDir..."
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
Copy-Item -Recurse -Force .\* $BackupDir

# --- Step 2: Copy updated files ---
Write-Host "🔄 Copying updated files from ZIP..."
$filesToCopy = @(
    "supabase\functions\ai-insights\index.ts",
    "supabase\functions\analyze-feedback\index.ts",
    "src\lib\supabaseClient.ts",
    "src\lib\supabaseServer.ts",
    "src\components\SupabaseProvider.tsx",
    "src\app\admin\layout.tsx",
    "src\app\admin\page.tsx",
    "src\app\admin\dashboard\page.tsx",
    "src\app\admin\feedback\page.tsx",
    "src\components\AIInsightsPanel.tsx",
    "src\components\FeedbackInsightsPanel.tsx",
    "src\components\Sidebar.tsx",
    "src\components\ExportButtons.tsx",
    "package.json",
    "tsconfig.json",
    "next.config.js",
)

foreach ($file in $filesToCopy) {
    $source = Join-Path $ZipDir $file
    $dest = Join-Path (Get-Location) $file
    Copy-Item -Force $source $dest
   }

