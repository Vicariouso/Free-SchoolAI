#!/usr/bin/env python3
"""Fail if the School Prompts catalogue drifts."""
import json, subprocess, sys
from pathlib import Path

EXPECTED = 655

root = Path(__file__).resolve().parent
catalogue = json.loads((root / "catalogue.json").read_text())
allowed = {
    "Classroom", "Resources", "Primary", "KS3", "GCSE", "Sixth form",
    "Schemes", "Revision", "Form tutor", "Cover", "Early years",
    "Pastoral care", "SEND support", "This term", "Improvement planning",
    "Staffing and HR", "Policy and compliance", "Governors and trustees",
    "Letters and messages", "Admin and documents", "Exams office",
    "You and your work",
}
errors = []
if len(catalogue) != EXPECTED:
    errors.append(f"catalogue has {len(catalogue)} jobs, expected {EXPECTED}")
ids = [item["id"] for item in catalogue]
if ids != [f"{n:03d}" for n in range(1, len(catalogue) + 1)]:
    errors.append(f"ids are not 001 to {len(catalogue):03d} in order")
on_disk = {p.name for p in (root / "jobs").glob("*.txt")}
listed = {Path(item["file"]).name for item in catalogue}
for extra in sorted(on_disk - listed):
    errors.append(f"jobs/{extra} is not in the catalogue")
slugs = [item["slug"] for item in catalogue]
if len(set(slugs)) != len(slugs):
    errors.append("duplicate slugs")
for item in catalogue:
    if item["category"] not in allowed:
        errors.append(f"{item['id']} unknown category {item['category']}")
    path = root / item["file"]
    if not path.is_file():
        errors.append(f"missing {item['file']}")
        continue
    text = path.read_text()
    if f"# {item['id']} {item['name']}" not in text:
        errors.append(f"{item['file']} header mismatch")
    if item["gate"] and "STOP. This job can become a pupil, staff or legal record." not in text:
        errors.append(f"{item['file']} is gated but has no STOP banner")
    if not item["gate"] and "STOP. This job can become" in text:
        errors.append(f"{item['file']} has a STOP banner but is not gated")
readme = (root / "README.md").read_text()
if "items-a.ts" in readme:
    errors.append("README still sends staff to TypeScript files")
licence = (root / "LICENSE").read_text()
if "Creative Commons Attribution 4.0 International Public License" not in licence:
    errors.append("LICENSE is not the CC BY 4.0 text GitHub can detect")
built = subprocess.run([sys.executable, str(root / "build_library.py"), "--check"], capture_output=True, text=True)
if built.returncode != 0:
    errors.append((built.stderr or built.stdout).strip())
if errors:
    print("\n".join(errors))
    sys.exit(1)
print(f"ok {len(catalogue)} jobs")
