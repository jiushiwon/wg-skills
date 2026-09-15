@echo off
setlocal

if "%JAVA_HOME%" == "" (
  set "JAVA_CMD=java.exe"
) else (
  set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
)

set "WRAPPER_JAR=%~dp0\.mvn\wrapper\maven-wrapper.jar"
if not exist "%WRAPPER_JAR%" (
  echo Error: %WRAPPER_JAR% not found.
  exit /b 1
)

set "MAVEN_PROJECTBASEDIR=%~dp0"

"%JAVA_CMD%" -classpath "%WRAPPER_JAR%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
