
$bnPath = "k:\personal_ac\web\src\i18n\translations\bn.json"
$posPath = "k:\personal_ac\web\src\i18n\translations\pos_bn.json"
$contactsPath = "k:\personal_ac\web\src\i18n\translations\contacts_bn.json"

$bnJson = Get-Content -Path $bnPath -Raw -Encoding UTF8 | ConvertFrom-Json
$posJson = Get-Content -Path $posPath -Raw -Encoding UTF8 | ConvertFrom-Json
$contactsJson = Get-Content -Path $contactsPath -Raw -Encoding UTF8 | ConvertFrom-Json

# Create a new hashtable to store updated keys
$updatedData = @{}

# Copy existing keys
foreach ($prop in $bnJson.psobject.Properties) {
    $updatedData[$prop.Name] = $prop.Value
}

# Add POS keys
foreach ($prop in $posJson.psobject.Properties) {
    $updatedData[$prop.Name] = $prop.Value
}

# Add Contacts keys
foreach ($prop in $contactsJson.psobject.Properties) {
    $updatedData[$prop.Name] = $prop.Value
}

# Convert hashtable back to JSON (sorted keys)
$sortedKeys = $updatedData.Keys | Sort-Object
$finalObj = [ordered]@{}
foreach ($key in $sortedKeys) {
    $finalObj[$key] = $updatedData[$key]
}

$finalJson = $finalObj | ConvertTo-Json -Depth 100
[System.IO.File]::WriteAllText($bnPath, $finalJson, [System.Text.Encoding]::UTF8)
