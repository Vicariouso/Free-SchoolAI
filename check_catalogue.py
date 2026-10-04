#!/usr/bin/env python3
"""Fail if the Free-SchoolAI catalogue drifts."""
import json, sys
from pathlib import Path

root = Path(__file__).resolve().parent
catalogue = json.loads((root / "catalogue.json").read_text())
allowed = {
    "This term", "Classroom", "Form tutor", "Early years", "Primary",
    "Exams office", "Cover", "GCSE", "KS3", "Sixth form", "Schemes",
    "Revision", "School improvement", "Governance", "Systems and compliance",
    "Pupil support", "Day to day", "Communication", "Staff and personnel",
    "For you", "SEND and inclusion",
}
errors = []
if len(catalogue) != 595:
    errors.append(f"catalogue has {len(catalogue)} jobs, expected 595")
ids = [item["id"] for item in catalogue]
if ids != [f"{n:03d}" for n in range(1, 596)]:
    errors.append("ids are not 001 to 595 in order")
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
if errors:
    print("\n".join(errors))
    sys.exit(1)
print(f"ok {len(catalogue)} jobs")
