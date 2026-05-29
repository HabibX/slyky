# =========================================================
# List all folders/files recursively
# EXCLUDING every "node_modules" directory
# =========================================================

# Root folder to scan
$RootPath = "C:\xampp\htdocs\slyky"

# Output file
$OutputFile = "$RootPath\output.txt"

# Clear previous output if it exists
if (Test-Path $OutputFile) {
    Remove-Item $OutputFile
}

# Recursive function
function Get-Tree {

    param (
        [string]$Path,
        [int]$Level = 0
    )

    try {

        # Get all items
        $Items = Get-ChildItem -LiteralPath $Path -Force -ErrorAction Stop

        foreach ($Item in $Items) {

            # Skip all node_modules folders
            if ($Item.PSIsContainer -and $Item.Name -eq "node_modules") {
                continue
            }

            # Simple indentation
            $Indent = "    " * $Level

            # Folder / file label
            if ($Item.PSIsContainer) {
                $Line = $Indent + "[DIR]  " + $Item.Name
            }
            else {
                $Line = $Indent + "[FILE] " + $Item.Name
            }

            # Write to output
            Add-Content -Path $OutputFile -Value $Line

            # Recursive scan
            if ($Item.PSIsContainer) {
                Get-Tree -Path $Item.FullName -Level ($Level + 1)
            }
        }
    }
    catch {
        Add-Content -Path $OutputFile -Value ("ERROR accessing: " + $Path)
    }
}

# Start scan
Get-Tree -Path $RootPath

Write-Host ""
Write-Host "Done."
Write-Host ("Output saved to: " + $OutputFile)