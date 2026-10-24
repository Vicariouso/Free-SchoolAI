#!/usr/bin/env python3
"""Build the self-hosted library from catalogue.json and shelves.json.

Writes library/data.js (the folder version) and dist/free-schoolai.html (one
file with everything inside). Run it again after editing catalogue.json.
Only the Python standard library is needed.

    python3 build_library.py           # build
    python3 build_library.py --check  # fail if the built files are out of date
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LIB = ROOT / "library"


def data_js() -> str:
    catalogue = json.loads((ROOT / "catalogue.json").read_text())
    shelves = json.loads((ROOT / "shelves.json").read_text())
    jobs = [{k: v for k, v in item.items() if k != "file"} for item in catalogue]
    data = {"jobs": jobs, **shelves}
    body = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return "// Built by build_library.py from catalogue.json and shelves.json. Do not edit.\nwindow.FSAI_DATA = " + body + ";\n"


def single_file(data: str) -> str:
    page = (LIB / "index.html").read_text()
    css = (LIB / "style.css").read_text()
    config = (LIB / "config.example.js").read_text()
    scripts = {
        "config.js": config,
        "data.js": data,
        "prompt.js": (LIB / "prompt.js").read_text(),
        "app.js": (LIB / "app.js").read_text(),
    }
    page = page.replace('<link rel="stylesheet" href="style.css">', "<style>\n" + css + "</style>")
    for name, code in scripts.items():
        tag = f'<script src="{name}"></script>'
        if tag not in page:
            raise SystemExit(f"index.html has no {tag}")
        # A closing script tag inside the data would end the block early.
        page = page.replace(tag, "<script>\n" + code.replace("</script", "<\\/script") + "</script>")
    icon = (LIB / "icon.svg").read_text().strip().replace("#", "%23").replace('"', "'")
    page = page.replace('href="icon.svg"', 'href="data:image/svg+xml,' + icon + '"')
    note = "<!-- School Prompts, one-file version. Edit the FSAI_CONFIG block below for your school. -->\n"
    return page.replace("<!doctype html>\n", "<!doctype html>\n" + note, 1)


def main() -> None:
    check = "--check" in sys.argv
    data = data_js()
    outputs = {LIB / "data.js": data, ROOT / "dist" / "free-schoolai.html": single_file(data)}
    stale = []
    for path, text in outputs.items():
        if check:
            if not path.exists() or path.read_text() != text:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(exist_ok=True)
            path.write_text(text)
    if stale:
        raise SystemExit("out of date, run python3 build_library.py: " + ", ".join(stale))
    jobs = json.loads((ROOT / "catalogue.json").read_text())
    print(("ok" if check else "built") + f" library for {len(jobs)} jobs")


if __name__ == "__main__":
    main()
