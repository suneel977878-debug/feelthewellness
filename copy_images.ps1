$source = 'C:\Users\sahil\.gemini\antigravity\brain\d41e60f8-929c-4312-bbb6-5d9ab132a066\prod_26_open_1782121032890.png'
$destDir = 'c:\Users\sahil\Downloads\SexToys\public\products\'
New-Item -ItemType Directory -Force -Path $destDir

$ids = 26, 27, 28, 29, 30
$types = 'open', 'boxed', 'unboxed', 'angle'

foreach ($id in $ids) {
    foreach ($type in $types) {
        $destPath = Join-Path -Path $destDir -ChildPath "prod_${id}_${type}.jpg"
        Copy-Item -Path $source -Destination $destPath
    }
}
