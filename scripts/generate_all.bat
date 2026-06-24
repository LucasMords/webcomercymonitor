@echo off
echo Generating Titan 45 OLED...
blender --background --python scripts\generate_titan45.py
echo.

echo Generating Spectra 32 OLED...
blender --background --python scripts\generate_spectra32.py
echo.

echo Generating ProVision 32...
blender --background --python scripts\generate_provision32.py
echo.

echo All models generated!
echo Check public/models/ for GLB files.
dir public\models\*.glb 2>nul || echo No GLB files found.
pause
