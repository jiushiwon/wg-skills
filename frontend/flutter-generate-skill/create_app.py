"""Create an Android/iOS Flutter project and install the starter."""
import argparse
from pathlib import Path
import re
import shutil
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("directory", type=Path)
parser.add_argument("project_name")
parser.add_argument("organization")
args = parser.parse_args()

if not re.fullmatch(r"[a-z][a-z0-9_]*", args.project_name):
    parser.error("Use a lowercase Dart package name.")
if not re.fullmatch(r"[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+", args.organization):
    parser.error("Use a reverse DNS organization such as com.example.")
if args.directory.exists() or args.directory.is_symlink():
    parser.error("Target directory must be new.")
flutter = shutil.which("flutter")
if not flutter:
    parser.error("Flutter SDK is required on PATH.")
target = args.directory.resolve()
subprocess.run(
    [flutter, "create", "--empty", "--no-pub", "--platforms=android,ios",
     "--project-name", args.project_name, "--org", args.organization, str(target)],
    check=True,
)
assets = Path(__file__).resolve().parent / "assets"
shutil.copytree(assets / "lib", target / "lib", dirs_exist_ok=True)
shutil.copytree(assets / "test", target / "test", dirs_exist_ok=True)
pubspec = target / "pubspec.yaml"
spec = pubspec.read_text(encoding="utf-8")
if not re.search(r"(?m)^  flutter_test:", spec):
    if re.search(r"(?m)^dev_dependencies:\s*$", spec):
        spec = spec.replace("dev_dependencies:", "dev_dependencies:\n  flutter_test:\n    sdk: flutter", 1)
    else:
        spec += "\ndev_dependencies:\n  flutter_test:\n    sdk: flutter\n"
    pubspec.write_text(spec, encoding="utf-8")
dart = shutil.which("dart")
if not dart:
    parser.error("The Flutter SDK dart executable must also be on PATH.")
version = subprocess.check_output([flutter, "--version", "--machine"], text=True)
import json
match = re.match(r"(\d+)\.(\d+)", json.loads(version)["frameworkVersion"])
if match and tuple(map(int, match.groups())) >= (3, 50):
    subprocess.run([flutter, "pub", "add", "material_ui"], cwd=target, check=True)
    for source in (target / "lib").glob("*.dart"):
        source.write_text(source.read_text(encoding="utf-8").replace(
            "package:flutter/material.dart", "package:material_ui/material_ui.dart"),
            encoding="utf-8")
    test = target / "test/navigation_test.dart"
    test.write_text(test.read_text(encoding="utf-8").replace(
        "package:flutter/material.dart", "package:material_ui/material_ui.dart"),
        encoding="utf-8")
test = target / "test/navigation_test.dart"
test.write_text(test.read_text(encoding="utf-8").replace(
    "../lib/app.dart", f"package:{args.project_name}/app.dart"), encoding="utf-8")
subprocess.run([flutter, "pub", "get"], cwd=target, check=True)
subprocess.run([dart, "format", "lib", "test"], cwd=target, check=True)
