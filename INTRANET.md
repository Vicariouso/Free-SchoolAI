# Putting Free-SchoolAI on your school intranet

For the IT team of a school or trust in England. It takes about ten minutes.

Read [Using it safely](USING-IT-SAFELY.md) and the [terms of use and disclaimer](DISCLAIMER.md) first. Free-SchoolAI is provided as is, with no warranty and no support, and your school is responsible for how it is used. Installing it means your school accepts those terms.

The library is a static web page: HTML, CSS and JavaScript in one folder. There is no server code, no database, no sign-in, no build step and no calls to anywhere else. Staff details stay in each browser's local storage. You can read every line before you install it.

## What you get

- `library/`: the library as a folder. Put it on any web server.
- `dist/free-schoolai.html`: the same library as one file, for places that take a single file.
- `library/config.example.js`: your school's settings.

Staff can search all 655 jobs, browse by shelf or by moment in the school year, fill in a job, copy the prompt, and copy follow-up prompts for when the draft comes back. Jobs that can become a pupil, staff or legal record are marked **Record**.

## 1. Get the files

```
git clone https://github.com/Vicariouso/Free-SchoolAI.git
```

Or use **Code → Download ZIP** on GitHub.

## 2. Set it up for your school

```
cp library/config.example.js library/config.js
```

Then edit `library/config.js`. Every setting is optional:

| Setting | What it does |
|---|---|
| `title`, `intro` | The heading and line staff see at the top |
| `school` | Your school's name, phase, size and tone, filled into every prompt |
| `lockSchool` | `true` stops staff changing those school details |
| `modelAdvice` | Which AI tool staff should use, shown on every page |
| `recordAdvice` | What staff must do with Record jobs, shown on each one |
| `hideRecordJobs` | `true` hides Record jobs altogether |
| `hideCategories` | Shelves you do not need, for example `["GCSE", "Sixth form", "KS3"]` in a primary |
| `contact` | Who to ask, shown in the footer |
| `customJobs` | Your own prompts, shown on an "Our school" shelf |

Your `config.js` is listed in `.gitignore`, so updating the library never overwrites it.

For the one-file version, edit the `window.FSAI_CONFIG` block near the top of `dist/free-schoolai.html` instead.

Do not put pupil or staff personal data in the settings. They are visible to anyone who can open the page.

## 3. Put it somewhere staff can reach

Pick whichever you already run.

**A web server on site or in the cloud (IIS, Apache, nginx, Azure Static Web Apps, and so on).** Copy the `library` folder to the site and browse to `index.html`. No server-side settings are needed. If the site sits behind your staff sign-in, so does the library.

**SharePoint Online or Teams.** SharePoint document libraries do not run uploaded web pages; they download them. So host the folder on a web server first (above), then:

- on a SharePoint page, add an **Embed** web part with the library's address (a SharePoint admin may need to allow the domain under the site's HTML Field Security settings), or
- in Teams, add a **Website** tab with the library's address.

**Google Sites.** Host the folder on a web server, then use **Insert → Embed → By URL**.

**A shared drive.** Copy the folder, or the single file, to the drive. Staff open `index.html` (or `free-schoolai.html`) in Edge or Chrome. Copy buttons, saved details and starred jobs all work from a file. Each computer keeps its own saved details.

## Security notes

- No network requests. Nothing is sent anywhere, so there is nothing to allow-list outbound.
- No cookies. Saved details, starred and recently copied jobs are in the browser's local storage under keys starting `fsai:intranet:`.
- No inline scripts or styles in the folder version, so a strict policy works:

  ```
  Content-Security-Policy: default-src 'self'; connect-src 'none'; frame-ancestors 'self'
  ```

  Widen `frame-ancestors` to your SharePoint or Teams domain if you embed it there.
- Pages ask search engines not to index them (`noindex`).
- Everything is built with DOM text, never raw HTML, so custom job text cannot inject markup.

## Your own prompts

Add them to `customJobs` in `config.js`:

```js
customJobs: [
  {
    name: "Friday bulletin item",
    job: "Write a 120-word item for the Friday staff bulletin from the notes pasted. Plain, warm, one action.",
    role: "a member of school staff",
    gate: false,
    guidance: ["Our bulletin style guide"]
  }
]
```

They get the same rules as every other job: British English, English law and DfE guidance only, no invented facts.

## Updating

```
git pull
```

Then copy the `library` folder to the server again. Your `config.js` is kept. Check the `catalogue.json` history on GitHub to see what changed.

## Changing the catalogue

You can also edit `catalogue.json` directly, for example to reword a job. Then rebuild:

```
python3 build_library.py
```

Only the Python standard library is needed. `python3 check_catalogue.py` checks the catalogue and the built files.

## Terms

The full [terms of use and disclaimer](DISCLAIMER.md) are also in every page footer of the library. Please leave them in.

## Licence and credit

[CC BY 4.0](LICENSE). Use it, change it, keep the credit: Free-SchoolAI by Joshua Mangas. The credit line in the page footer covers this; please leave it in.

These prompts write drafts. They do not hold a duty, sit on a board, or sign a reference. A person with the right role checks every draft before it is sent, filed or used in a meeting.
