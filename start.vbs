Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(WScript.ScriptFullName)

' ── Frontend BAT ────────────────────────────────────────────────────────────
frontendBat = fso.GetSpecialFolder(2) & "\dental_frontend.bat"
Set f = fso.OpenTextFile(frontendBat, 2, True)
f.WriteLine "@echo off"
f.WriteLine "title Dental Scheduling MVP — Frontend"
f.WriteLine ":: Освобождаем порт 5173 если занят"
f.WriteLine "for /f ""tokens=5"" %%a in ('netstat -aon ^| findstr "":5173 "" ^| findstr ""LISTENING"" 2^>nul') do taskkill /f /pid %%a >nul 2>&1"
f.WriteLine "cd /d """ & root & "\app"""
f.WriteLine "echo."
f.WriteLine "echo  [Frontend] http://localhost:5173"
f.WriteLine "echo  Press Ctrl+C to stop"
f.WriteLine "echo."
f.WriteLine "npm run dev"
f.Close

' ── Запуск ──────────────────────────────────────────────────────────────────
wtExe = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Microsoft\WindowsApps\wt.exe"

If fso.FileExists(wtExe) Then
    shell.Run "wt cmd /k """ & frontendBat & """", 1, False
Else
    shell.Run "cmd /k """ & frontendBat & """", 1, False
End If

' ── Открыть браузер после старта ────────────────────────────────────────────
WScript.Sleep 5000
shell.Run "http://localhost:5173"
