# Free-SchoolAI

Free prompts for school staff in England. Not the DfE free school programme. Not the commercial product SchoolAI. Just the price.

655 jobs. Early years through sixth form, plus SEND, leadership, the office and the board. The jobs are in this repo, as plain text.

Use it online, with a page for every job: https://joshuamangas.com/free-school-ai/

## Put it on your school intranet

The `library` folder is the whole searchable library as a static web page: no server code, no sign-in, no calls to anywhere else. Your IT team sets the school's details once, and every member of staff gets prompts that start filled in. There is also a one-file version in `dist/`.

How to install it: [INTRANET.md](INTRANET.md).

## How each prompt is built

Every job carries the same rules (British English and the terms schools in England use, English law and DfE guidance only, no invented facts, ask only when nothing useful can be drafted), then:

- the guidance to paste, named by title and edition, with a link to the publisher (`guidance_links` in the catalogue);
- what good looks like for this job;
- what the draft must contain and the checks the model runs before handing it over, set by the job's `kind`;
- a context block for the school and the job.

The guidance was checked against published sources on 20 October 2026. Guidance changes: paste the current edition.

## Use a prompt

1. Open the job file. Example: [jobs/441-raising-attendance-across-the-school.txt](jobs/441-raising-attendance-across-the-school.txt).
2. Copy from the line `Paste everything below this line.`
3. Fill in the school context.
4. Run it on a machine you control, or in a chat your data protection officer has already approved.
5. A person with the right role checks the draft before it is sent, filed or used in a meeting.

If the file says `Gate: yes`, do not paste it into a public chat. That job can become a pupil, staff or legal record. A local model is still not the decision-maker.

For names, health, behaviour, safeguarding or HR, keep the work off public tools.

## Using it safely

What the library is reliable for, what it is not, how it was tested, and seven rules for staff: [USING-IT-SAFELY.md](USING-IT-SAFELY.md).

## Terms of use

Free-SchoolAI is provided as is, with no warranty and no support. It is not professional advice. Your school decides whether and how to use it and is responsible for that use and for every draft. Read the full [terms of use and disclaimer](DISCLAIMER.md).

## What the licence covers

[CC BY 4.0](LICENSE). The licence covers the prompt text in this repo. Use it. Change it. Keep the credit: Free-SchoolAI by Joshua Mangas.

The licence does not cover a school's finished letter, a pupil record, or documents you paste in. Those stay yours.

These prompts are not Ofsted, DfE, a solicitor or a clinician. They do not hold a duty. Written for schools in England only. It follows English law, DfE guidance and the Ofsted framework, not the rules in Wales, Scotland or Northern Ireland. Guidance named in a job file is dated. If a newer edition is in force, paste that edition.

## Check

`python3 check_catalogue.py` fails if the count, ids, categories or gate banners drift, or if the built library is out of date. After editing `catalogue.json`, run `python3 build_library.py`.
