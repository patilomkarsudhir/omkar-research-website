@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: Scholar Cache Update Script
:: ==============================================================================
:: This script updates the Google Scholar cache, commits changes, and pushes to git
:: Run this as Administrator for best results
:: ==============================================================================

:: Create log file with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value 2^>nul') do set "dt=%%a"
if defined dt (
    set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"
) else (
    for /f %%i in ('powershell -NoProfile -Command "(Get-Date -Format yyyy-MM-dd_HH-mm-ss)"') do set "timestamp=%%i"
)
set "LOGFILE=%~dp0update-scholar-%timestamp%.log"

:: Check if running interactively (for pause behavior)
set "INTERACTIVE=0"
echo %cmdcmdline% | find /i "/c" >nul || set "INTERACTIVE=1"

echo.
echo ========================================
echo  Scholar Cache Update Script
echo  Started: %date% %time%
echo ========================================
echo.
echo.>>"%LOGFILE%"
echo ========================================>>"%LOGFILE%"
echo  Scholar Cache Update Script>>"%LOGFILE%"
echo  Started: %date% %time%>>"%LOGFILE%"
echo ========================================>>"%LOGFILE%"
echo.>>"%LOGFILE%"

:: Get the script directory and navigate to project root
pushd "%~dp0.."
if !errorlevel! neq 0 (
    echo ERROR: Failed to navigate to project directory
    echo ERROR: Failed to navigate to project directory>>"%LOGFILE%"
    call :maybePause
    exit /b 1
)
set PROJECT_DIR=%CD%

echo Current directory: %PROJECT_DIR%
echo.
echo Current directory: %PROJECT_DIR%>>"%LOGFILE%"
echo.>>"%LOGFILE%"

::Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Make sure you're in the project root.
    echo Current directory: %CD%
    echo ERROR: package.json not found. Make sure you're in the project root.>>"%LOGFILE%"
    echo Current directory: %CD%>>"%LOGFILE%"
    popd
    call :maybePause
    exit /b 1
)

if not exist "data\scholar-cache.json" (
    echo ERROR: scholar-cache.json not found in data directory.
    echo Current directory: %CD%
    echo ERROR: scholar-cache.json not found in data directory.>>"%LOGFILE%"
    echo Current directory: %CD%>>"%LOGFILE%"
    popd
    call :maybePause
    exit /b 1
)

:: Check if Node.js/npm is available
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo ERROR: npm not found. Please ensure Node.js is installed and in PATH.
    echo ERROR: npm not found. Please ensure Node.js is installed and in PATH.>>"%LOGFILE%"
    popd
    call :maybePause
    exit /b 1
)

:: Check if git is available
where git >nul 2>&1
if !errorlevel! neq 0 (
    echo WARNING: git not found. Git operations will be skipped.
    echo WARNING: git not found. Git operations will be skipped.>>"%LOGFILE%"
    set "GIT_AVAILABLE=false"
) else (
    set "GIT_AVAILABLE=true"
)

:: Step 1: Update Scholar Cache
echo Step 1: Updating Scholar cache...
echo ----------------------------------------
echo Step 1: Updating Scholar cache...>>"%LOGFILE%"
echo ---------------------------------------->>"%LOGFILE%"

:: Save current output to log
echo Running: npm run update-scholar>>"%LOGFILE%"
call npm run update-scholar >>"%LOGFILE%" 2>&1

if !errorlevel! neq 0 (
    echo.
    echo ERROR: Failed to update scholar cache.
    echo This could be due to:
    echo - Network connectivity issues
    echo - Google Scholar rate limiting
    echo - Missing dependencies
    echo.
    echo Try running 'npm install' first, then try again.
    echo Check log file: %LOGFILE%
    echo.>>"%LOGFILE%"
    echo ERROR: Failed to update scholar cache.>>"%LOGFILE%"
    echo This could be due to:>>"%LOGFILE%"
    echo - Network connectivity issues>>"%LOGFILE%"
    echo - Google Scholar rate limiting>>"%LOGFILE%"
    echo - Missing dependencies>>"%LOGFILE%"
    echo.>>"%LOGFILE%"
    echo Try running 'npm install' first, then try again.>>"%LOGFILE%"
    popd
    call :maybePause
    exit /b 1
)

echo.
echo [OK] Scholar cache updated successfully!
echo.
echo.>>"%LOGFILE%"
echo [OK] Scholar cache updated successfully!>>"%LOGFILE%"
echo.>>"%LOGFILE%"

:: Skip git operations if git is not available
if "%GIT_AVAILABLE%"=="false" (
    echo Git not available - skipping version control operations
    echo Git not available - skipping version control operations>>"%LOGFILE%"
    goto :end
)

:: Step 2: Check if there are changes to commit
echo Step 2: Checking for changes...
echo ----------------------------------------
echo Step 2: Checking for changes...>>"%LOGFILE%"
echo ---------------------------------------->>"%LOGFILE%"

:: Check if we're in a git repository
if not exist ".git" (
    echo WARNING: Not in a git repository. Skipping git operations.
    echo WARNING: Not in a git repository. Skipping git operations.>>"%LOGFILE%"
    goto :end
)

:: Check if scholar-cache.json has changes
git diff --quiet data/scholar-cache.json 2>nul
if !errorlevel! equ 0 (
    echo No changes detected in scholar-cache.json
    echo Cache is already up to date.
    echo No changes detected in scholar-cache.json>>"%LOGFILE%"
    echo Cache is already up to date.>>"%LOGFILE%"
    goto :end
)

echo Changes detected in scholar-cache.json
echo.
echo Changes detected in scholar-cache.json>>"%LOGFILE%"
echo.>>"%LOGFILE%"

:: Step 3: Stage changes
echo Step 3: Staging changes...
echo ----------------------------------------
echo Step 3: Staging changes...>>"%LOGFILE%"
echo ---------------------------------------->>"%LOGFILE%"
git add data/scholar-cache.json >>"%LOGFILE%" 2>&1

if !errorlevel! neq 0 (
    echo ERROR: Failed to stage changes.
    echo Check log file: %LOGFILE%
    echo ERROR: Failed to stage changes.>>"%LOGFILE%"
    popd
    call :maybePause
    exit /b 1
)

echo [OK] Changes staged successfully!
echo.
echo [OK] Changes staged successfully!>>"%LOGFILE%"
echo.>>"%LOGFILE%"

:: Step 4: Commit changes
echo Step 4: Committing changes...
echo ----------------------------------------
echo Step 4: Committing changes...>>"%LOGFILE%"
echo ---------------------------------------->>"%LOGFILE%"

:: More robust timestamp generation
if defined dt (
    set "commit_timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%"
) else (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set "commit_timestamp=%%c-%%a-%%b"
)

git commit -m "chore: update scholar cache - %commit_timestamp%" >>"%LOGFILE%" 2>&1

if !errorlevel! neq 0 (
    echo ERROR: Failed to commit changes.
    echo This could be due to git configuration issues.
    echo Check log file: %LOGFILE%
    echo ERROR: Failed to commit changes.>>"%LOGFILE%"
    echo This could be due to git configuration issues.>>"%LOGFILE%"
    popd
    call :maybePause
    exit /b 1
)

echo [OK] Changes committed successfully!
echo.
echo [OK] Changes committed successfully!>>"%LOGFILE%"
echo.>>"%LOGFILE%"

:: Step 5: Push to remote
echo Step 5: Pushing to remote repository...
echo ----------------------------------------
echo Step 5: Pushing to remote repository...>>"%LOGFILE%"
echo ---------------------------------------->>"%LOGFILE%"

:: Check if we have a remote configured
git remote get-url origin >nul 2>&1
if !errorlevel! neq 0 (
    echo WARNING: No remote 'origin' configured. Skipping push.
    echo WARNING: No remote 'origin' configured. Skipping push.>>"%LOGFILE%"
    goto :end
)

git push >>"%LOGFILE%" 2>&1

if !errorlevel! neq 0 (
    echo ERROR: Failed to push changes to remote repository.
    echo This could be due to:
    echo - Network connectivity issues
    echo - Authentication problems
    echo - Remote repository access issues
    echo - Your branch may be behind the remote
    echo.
    echo You can manually push later with: git push
    echo Check log file: %LOGFILE%
    echo ERROR: Failed to push changes to remote repository.>>"%LOGFILE%"
    echo This could be due to:>>"%LOGFILE%"
    echo - Network connectivity issues>>"%LOGFILE%"
    echo - Authentication problems>>"%LOGFILE%"
    echo - Remote repository access issues>>"%LOGFILE%"
    echo - Your branch may be behind the remote>>"%LOGFILE%"
    echo.>>"%LOGFILE%"
    echo You can manually push later with: git push>>"%LOGFILE%"
    
    :: Don't exit with error for push failures - changes are still committed locally
    echo.
    echo WARNING: Push failed but changes are committed locally.
    echo.>>"%LOGFILE%"
    echo WARNING: Push failed but changes are committed locally.>>"%LOGFILE%"
    goto :end
)

echo [OK] Changes pushed to remote repository successfully!
echo.
echo [OK] Changes pushed to remote repository successfully!>>"%LOGFILE%"
echo.>>"%LOGFILE%"

:end
popd
echo ========================================
echo  Scholar Cache Update Complete!
echo  Finished: %date% %time%
echo ========================================
echo.
echo Summary of actions performed:
echo [OK] Updated scholar cache with latest data
if "%GIT_AVAILABLE%"=="true" (
    if exist ".git" (
        echo [OK] Committed changes to git
        echo [OK] Attempted to push changes to remote repository
    )
)
echo.
echo Your website now has the latest publication data!
echo Log file saved to: %LOGFILE%
echo.

echo ========================================>>"%LOGFILE%"
echo  Scholar Cache Update Complete!>>"%LOGFILE%"
echo  Finished: %date% %time%>>"%LOGFILE%"
echo ========================================>>"%LOGFILE%"
echo.>>"%LOGFILE%"
echo Summary of actions performed:>>"%LOGFILE%"
echo [OK] Updated scholar cache with latest data>>"%LOGFILE%"
if "%GIT_AVAILABLE%"=="true" (
    if exist ".git" (
        echo [OK] Committed changes to git>>"%LOGFILE%"
        echo [OK] Attempted to push changes to remote repository>>"%LOGFILE%"
    )
)
echo.>>"%LOGFILE%"
echo Your website now has the latest publication data!>>"%LOGFILE%"

:: Helper function for conditional pause
:maybePause
if "%INTERACTIVE%"=="1" (
    echo Press any key to exit...
    pause > nul
)
exit /b 0
