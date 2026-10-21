/* Free-SchoolAI library for a school intranet.
   No server, no network calls, no cookies. Staff details live in this browser's
   localStorage only. Everything is built with DOM calls, never innerHTML. */
(function () {
  "use strict";

  var D = window.FSAI_DATA;
  var F = window.FSAI;
  var C = window.FSAI_CONFIG || {};
  var app = document.getElementById("app");
  var announcer = document.getElementById("announce");
  var TITLE = C.title || "Prompt library";
  var PAGE = 24;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DEFAULT_FOLLOW_UPS = ["show-where-every-figure-came-from", "cut-it-by-half", "read-it-as-the-audience"];

  /* ---------- storage ---------- */
  var KEY = "fsai:intranet:";
  function load(name, fallback) {
    try {
      var raw = window.localStorage.getItem(KEY + name);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(name, value) {
    try {
      window.localStorage.setItem(KEY + name, JSON.stringify(value));
    } catch (e) {
      /* Not saved; the page still works for this visit. */
    }
  }

  /* ---------- the school profile ---------- */
  var CONFIG_SCHOOL = C.school || {};
  var PROFILE_KEYS = ["school", "phase", "community", "role", "tone", "subject", "years"];
  var SCHOOL_KEYS = ["school", "phase", "community", "tone"];
  var PROFILE_FIELDS = [
    { key: "school", label: "School or trust", placeholder: "Samplefold Community Primary School" },
    { key: "phase", label: "Phase and type", placeholder: "Maintained primary, ages 3 to 11" },
    { key: "community", label: "Size, community, designation", placeholder: "312 on roll, rural, Church of England" },
    { key: "tone", label: "House tone", placeholder: "Warm and plain" },
    { key: "role", label: "Your role", placeholder: "Year 4 teacher and English lead" },
    { key: "subject", label: "Subjects you teach", placeholder: "English, history" },
    { key: "years", label: "Usual year groups or classes", placeholder: "Year 4, mixed ability, 28 pupils" },
  ];

  function locked(key) {
    return Boolean(C.lockSchool && SCHOOL_KEYS.indexOf(key) !== -1 && CONFIG_SCHOOL[key]);
  }

  function profile() {
    var mine = load("profile", {});
    var out = {};
    PROFILE_KEYS.forEach(function (k) {
      var fromConfig = typeof CONFIG_SCHOOL[k] === "string" ? CONFIG_SCHOOL[k] : "";
      var own = mine && typeof mine[k] === "string" ? mine[k] : "";
      out[k] = locked(k) ? fromConfig : own || fromConfig;
    });
    return out;
  }

  function setProfile(key, value) {
    var mine = load("profile", {}) || {};
    mine[key] = String(value).slice(0, 400);
    save("profile", mine);
  }

  /* ---------- jobs ---------- */
  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function strings(list) {
    return Array.isArray(list) ? list.filter(function (x) { return typeof x === "string" && x.trim(); }) : [];
  }

  var custom = (Array.isArray(C.customJobs) ? C.customJobs : [])
    .filter(function (j) { return j && typeof j.name === "string" && typeof j.job === "string" && j.name.trim() && j.job.trim(); })
    .map(function (j, i) {
      var guidance = strings(j.guidance);
      return {
        id: "S" + String(i + 1).padStart(2, "0"),
        slug: "our-" + slugify(j.name) + "-" + (i + 1),
        name: j.name.trim(),
        category: "Our school",
        role: typeof j.role === "string" && j.role.trim() ? j.role.trim() : "a member of school staff",
        gate: j.gate === true,
        guidance: guidance,
        have_ready: guidance,
        job: j.job.trim(),
        fields: typeof j.fields === "string" ? j.fields : "",
        kind: typeof j.kind === "string" && D.kinds[j.kind] ? j.kind : "",
        guidance_links: [],
        follow_ups: DEFAULT_FOLLOW_UPS,
      };
    });

  var hidden = strings(C.hideCategories);
  var JOBS = custom.concat(
    D.jobs.filter(function (j) {
      if (C.hideRecordJobs && j.gate) return false;
      return hidden.indexOf(j.category) === -1;
    })
  );
  var BY_SLUG = {};
  JOBS.forEach(function (j) { BY_SLUG[j.slug] = j; });

  var SHELVES = (custom.length ? [{ id: "ours", label: "Our school", categories: ["Our school"] }] : []).concat(
    D.shelves
      .map(function (s) {
        return { id: s.id, label: s.label, categories: s.categories.filter(function (c) { return hidden.indexOf(c) === -1; }) };
      })
      .filter(function (s) { return s.categories.length; })
  );
  var MOMENTS = D.moments
    .map(function (m) {
      return { id: m.id, label: m.label, blurb: m.blurb, months: m.months, slugs: m.slugs.filter(function (s) { return BY_SLUG[s]; }) };
    })
    .filter(function (m) { return m.slugs.length >= 3; });

  function jobsFor(slugs) {
    return slugs.map(function (s) { return BY_SLUG[s]; }).filter(Boolean);
  }

  /* ---------- small DOM helpers ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k === "value") el.value = v;
        else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? "" : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) child.forEach(function (c) { add(el, c); });
    else el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
  function announce(msg) {
    announcer.textContent = "";
    window.setTimeout(function () { announcer.textContent = msg; }, 30);
  }

  function copyText(text) {
    function fallback() {
      try {
        var area = h("textarea", { readonly: true, class: "offscreen" });
        area.value = text;
        document.body.appendChild(area);
        area.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(area);
        return Promise.resolve(ok);
      } catch (e) {
        return Promise.resolve(false);
      }
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    }
    return fallback();
  }

  function flash(button, ok, idle) {
    button.textContent = ok ? "Copied" : "Copy failed";
    announce(ok ? "Copied." : "Copy failed. Open the job and select the prompt by hand.");
    window.setTimeout(function () { button.textContent = idle; }, 1800);
  }

  function download(name, text) {
    var url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    var a = h("a", { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function todayLabel() {
    return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function jobLink(slug) {
    return window.location.href.split("#")[0] + "#/job/" + slug;
  }

  function starred() {
    return strings(load("starred", []));
  }
  function toggleStar(slug) {
    var now = starred();
    save("starred", now.indexOf(slug) === -1 ? [slug].concat(now) : now.filter(function (s) { return s !== slug; }));
  }
  function noteCopied(slug) {
    save("recent", [slug].concat(strings(load("recent", [])).filter(function (s) { return s !== slug; })).slice(0, 8));
  }

  /* ---------- routing ---------- */
  function route() {
    var hash = window.location.hash || "";
    var m = hash.match(/^#\/job\/([a-z0-9-]+)/);
    if (m && BY_SLUG[m[1]]) return renderJob(BY_SLUG[m[1]]);
    var qs = hash.indexOf("?") !== -1 ? hash.slice(hash.indexOf("?") + 1) : "";
    renderList(new URLSearchParams(qs));
  }

  function setListState(state) {
    var p = new URLSearchParams();
    Object.keys(state).forEach(function (k) { if (state[k]) p.set(k, state[k]); });
    var q = p.toString();
    window.history.replaceState(null, "", "#/" + (q ? "?" + q : ""));
  }

  /* ---------- shared pieces ---------- */
  function advice(text, kind) {
    return text ? h("div", { class: "callout" + (kind ? " " + kind : ""), role: "note" }, h("p", { text: text })) : null;
  }

  function profileForm() {
    var p = profile();
    var anySet = PROFILE_KEYS.some(function (k) { return p[k]; });
    var grid = h("div", { class: "grid-2" });
    PROFILE_FIELDS.forEach(function (f) {
      var id = "profile-" + f.key;
      var isLocked = locked(f.key);
      grid.appendChild(
        h(
          "label",
          { class: "field", for: id },
          h("span", { text: f.label + (isLocked ? " (set by school)" : "") }),
          h("input", {
            id: id,
            class: "input",
            value: p[f.key],
            placeholder: f.placeholder,
            autocomplete: "off",
            readonly: isLocked,
            oninput: function (e) {
              setProfile(f.key, e.target.value);
              document.dispatchEvent(new Event("fsai:profile"));
            },
          })
        )
      );
    });
    grid.appendChild(h("p", { class: "note wide", text: "Saved in this browser only. Nothing is sent anywhere. No pupil or staff names here." }));
    return h(
      "details",
      { class: "school", open: !anySet },
      h(
        "summary",
        null,
        h("span", { class: "school-title", text: p.school ? "Using " + p.school : "Fill in your details once" }),
        h("span", { class: "school-sub", text: anySet ? "Every prompt starts with these. Open to edit." : "Then every prompt you copy starts filled in." })
      ),
      grid
    );
  }

  /* ---------- the list ---------- */
  function renderList(params) {
    document.title = TITLE;
    var state = {
      q: params.get("q") || "",
      shelf: params.get("shelf") || "",
      c: params.get("c") || "",
      m: params.get("m") || "",
      view: params.get("view") || "",
    };
    var shown = PAGE;
    clear(app);

    var search = h("input", {
      id: "search",
      type: "search",
      class: "input search",
      value: state.q,
      placeholder: "Try: letter to parents, exit ticket, EHCP review",
      autocomplete: "off",
      oninput: function (e) {
        state.q = e.target.value;
        shown = PAGE;
        update();
      },
    });
    var chips = h("div", { class: "chips", role: "group", "aria-label": "Shelves" });
    var subChips = h("div", { class: "chips sub", role: "group", "aria-label": "Categories" });
    var moments = h("div", { class: "moments" });
    var head = h("div", { class: "results-head" });
    var grid = h("ul", { class: "cards" });
    var more = h("p", { class: "more" });

    add(app, [
      h("h1", { text: TITLE }),
      C.intro ? h("p", { class: "lead", text: C.intro }) : null,
      advice(C.modelAdvice),
      h("div", { class: "searchbar" }, h("label", { for: "search", class: "search-label", text: "What do you need to write?" }), search, chips, subChips),
      profileForm(),
      moments,
      head,
      grid,
      more,
    ]);

    function chip(label, pressed, onclick, small) {
      return h("button", { type: "button", class: "chip" + (small ? " small" : ""), "aria-pressed": pressed ? "true" : "false", onclick: onclick, text: label });
    }

    function pick(next) {
      Object.keys(next).forEach(function (k) { state[k] = next[k]; });
      shown = PAGE;
      update();
    }

    function update() {
      setListState(state);
      var stars = starred();
      var shelf = SHELVES.filter(function (s) { return s.id === state.shelf; })[0];
      var moment = MOMENTS.filter(function (m) { return m.id === state.m; })[0];
      var browsing = !state.q && !state.shelf && !state.c && !state.m && !state.view;

      clear(chips);
      add(chips, chip("All " + JOBS.length, browsing, function () { pick({ q: "", shelf: "", c: "", m: "", view: "" }); search.value = ""; }));
      SHELVES.forEach(function (s) {
        add(chips, chip(s.label, state.shelf === s.id && !state.m && !state.view, function () {
          pick({ shelf: state.shelf === s.id ? "" : s.id, c: "", m: "", view: "" });
        }));
      });
      if (stars.length) add(chips, chip("Starred " + stars.length, state.view === "starred", function () { pick({ view: state.view === "starred" ? "" : "starred", shelf: "", c: "", m: "" }); }));

      clear(subChips);
      if (shelf && shelf.categories.length > 1) {
        shelf.categories.forEach(function (c) {
          add(subChips, chip(c, state.c === c, function () { pick({ c: state.c === c ? "" : c }); }, true));
        });
      }

      clear(moments);
      if (browsing) {
        var recent = jobsFor(strings(load("recent", []))).slice(0, 4);
        if (recent.length) {
          add(moments, h("div", { class: "row" }, h("p", { class: "meta", text: "You copied recently" }),
            h("ul", { class: "recent" }, recent.map(function (j) { return h("li", null, h("a", { href: "#/job/" + j.slug, text: j.name })); }))));
        }
        var month = new Date().getMonth() + 1;
        var now = MOMENTS.filter(function (m) { return m.months.indexOf(month) !== -1; });
        var always = MOMENTS.filter(function (m) { return !m.months.length; });
        if (now.length) add(moments, momentRow("Right now, in " + MONTHS[month - 1], now));
        if (always.length) add(moments, momentRow("Any day", always));
      }

      var list;
      if (state.view === "starred") list = jobsFor(stars);
      else if (moment) list = jobsFor(moment.slugs);
      else {
        list = JOBS;
        if (shelf) list = list.filter(function (j) { return shelf.categories.indexOf(j.category) !== -1; });
        if (state.c) list = list.filter(function (j) { return j.category === state.c; });
      }
      if (state.q) list = F.search(list, state.q);

      clear(head);
      var title = state.view === "starred" ? "Your starred jobs" : moment ? moment.label : state.c || (shelf ? shelf.label : "Every job");
      add(head, [
        h("h2", { text: title }),
        h("p", { class: "count", text: list.length + (list.length === 1 ? " job" : " jobs") + (state.q ? ' for "' + state.q + '"' : "") + (moment ? ". " + moment.blurb : "") }),
        browsing ? null : h("button", { type: "button", class: "text-btn", text: "Clear filters", onclick: function () { search.value = ""; pick({ q: "", shelf: "", c: "", m: "", view: "" }); } }),
      ]);

      clear(grid);
      if (!list.length) {
        add(grid, h("li", { class: "empty" }, "Nothing matched. Try a shorter word, or use ",
          BY_SLUG["write-me-a-prompt"] ? h("a", { href: "#/job/write-me-a-prompt", text: "Write me a prompt for a job not here" }) : "a different word", "."));
      }
      list.slice(0, shown).forEach(function (j) { add(grid, h("li", null, card(j, stars.indexOf(j.slug) !== -1, update))); });

      clear(more);
      if (shown < list.length) {
        add(more, h("button", { type: "button", class: "btn ghost", text: "Show more (" + (list.length - shown) + " left)", onclick: function () { shown += PAGE * 2; update(); } }));
      }
    }

    function momentRow(label, list) {
      return h("div", { class: "row" }, h("p", { class: "meta", text: label }),
        h("ul", { class: "moment-list" }, list.map(function (m) {
          return h("li", null, h("button", { type: "button", class: "moment", onclick: function () { search.value = ""; pick({ m: m.id, q: "", shelf: "", c: "", view: "" }); } },
            h("span", { class: "moment-label", text: m.label }),
            h("span", { class: "moment-blurb", text: m.blurb }),
            h("span", { class: "moment-count", text: m.slugs.length + " jobs" })));
        })));
    }

    document.addEventListener("fsai:profile", onProfile);
    function onProfile() {
      if (!document.body.contains(grid)) return document.removeEventListener("fsai:profile", onProfile);
      update();
    }

    update();
  }

  function card(job, isStarred, refresh) {
    var copyBtn = h("button", { type: "button", class: "btn", text: "Copy prompt" });
    copyBtn.addEventListener("click", function () {
      copyText(F.buildPrompt(job, profile(), { today: todayLabel() })).then(function (ok) {
        if (ok) noteCopied(job.slug);
        flash(copyBtn, ok, "Copy prompt");
      });
    });
    var linkBtn = h("button", { type: "button", class: "btn ghost", text: "Copy link" });
    linkBtn.addEventListener("click", function () {
      copyText(jobLink(job.slug)).then(function (ok) { flash(linkBtn, ok, "Copy link"); });
    });
    return h("article", { class: "card" },
      h("div", { class: "card-top" },
        h("p", { class: "meta accent" }, job.category, job.gate ? h("span", { class: "record", text: "Record" }) : null),
        h("button", {
          type: "button",
          class: "star",
          "aria-pressed": isStarred ? "true" : "false",
          "aria-label": (isStarred ? "Unstar " : "Star ") + job.name,
          text: isStarred ? "★" : "☆",
          onclick: function () { toggleStar(job.slug); refresh(); },
        })),
      h("h3", null, h("a", { href: "#/job/" + job.slug, text: job.name })),
      h("p", { class: "card-job", text: job.job }),
      job.have_ready && job.have_ready.length ? h("p", { class: "card-ready" }, h("strong", { text: "Have ready: " }), job.have_ready.join("; ")) : null,
      h("div", { class: "card-actions" }, copyBtn, h("a", { class: "btn ghost", href: "#/job/" + job.slug, text: "Fill in first" }), linkBtn));
  }

  /* ---------- one job ---------- */
  function renderJob(job) {
    document.title = job.name + " · " + TITLE;
    clear(app);
    var answers = { today: todayLabel() };
    var f = F.fieldsFor(job);
    var pre = h("pre", { class: "prompt", tabindex: "0" });
    var words = h("span");

    function refresh() {
      var text = F.buildPrompt(job, profile(), answers);
      pre.textContent = text;
      words.textContent = " (" + text.split(/\s+/).length + " words)";
      return text;
    }

    var fields = h("div", { class: "grid-2" });
    f.extra.concat(f.job).forEach(function (field) {
      var id = "job-" + field.key;
      var p = profile();
      var placeholder = field.profileKey && p[field.profileKey] ? p[field.profileKey] : field.hint || "";
      var input = field.multiline
        ? h("textarea", { id: id, class: "input", rows: "7", placeholder: placeholder })
        : h("input", { id: id, class: "input", placeholder: placeholder, autocomplete: "off", value: answers[field.key] || "" });
      input.addEventListener("input", function () { answers[field.key] = input.value; refresh(); });
      add(fields, h("label", { class: "field" + (field.multiline ? " wide" : ""), for: id }, h("span", { text: field.label }), input));
    });

    var copyBtn = h("button", { type: "button", class: "btn", text: "Copy the prompt" });
    copyBtn.addEventListener("click", function () {
      copyText(refresh()).then(function (ok) {
        if (ok) noteCopied(job.slug);
        flash(copyBtn, ok, "Copy the prompt");
      });
    });
    var linkBtn = h("button", { type: "button", class: "btn ghost", text: "Copy link" });
    linkBtn.addEventListener("click", function () { copyText(jobLink(job.slug)).then(function (ok) { flash(linkBtn, ok, "Copy link"); }); });
    var isStarred = starred().indexOf(job.slug) !== -1;
    var starBtn = h("button", { type: "button", class: "btn ghost", "aria-pressed": isStarred ? "true" : "false", text: isStarred ? "★ Starred" : "☆ Star" });
    starBtn.addEventListener("click", function () {
      toggleStar(job.slug);
      var now = starred().indexOf(job.slug) !== -1;
      starBtn.setAttribute("aria-pressed", now ? "true" : "false");
      starBtn.textContent = now ? "★ Starred" : "☆ Star";
    });

    var followUps = (job.follow_ups || DEFAULT_FOLLOW_UPS).map(function (id) { return D.follow_ups[id]; }).filter(Boolean);
    var moments = MOMENTS.filter(function (m) { return m.slugs.indexOf(job.slug) !== -1; });
    var inMoments = {};
    moments.forEach(function (m) { m.slugs.forEach(function (s) { inMoments[s] = true; }); });
    var nearby = JOBS.filter(function (j) { return j.category === job.category && j.slug !== job.slug && !inMoments[j.slug]; }).slice(0, 6);

    var h1 = h("h1", { tabindex: "-1", text: job.name });
    add(app, [
      h("p", { class: "crumbs" }, h("a", { href: "#/", text: "← All jobs" }), " · " + job.category + " · Job " + job.id),
      h1,
      h("p", { class: "lead", text: job.job }),
      job.gate
        ? h("div", { class: "callout warn", role: "note" },
            h("p", { class: "callout-title", text: "This job can become a record" }),
            h("p", { text: C.recordAdvice || "It can end up as a pupil, staff or legal record. Never paste it into a public chat. Use the tool your school has approved, keep names out where you can, and let the person who owns the record decide." }))
        : advice(C.modelAdvice),
      h("div", { class: "ready-grid" },
        h("div", { class: "ready" }, h("p", { class: "meta", text: "Have this ready" }),
          job.guidance_links && job.guidance_links.length && D.guidance_checked
            ? h("p", { class: "note", text: "Guidance checked " + D.guidance_checked + ". Each link opens the current edition." })
            : null,
          h("ul", null,
            (job.guidance_links && job.guidance_links.length
              ? job.guidance_links.map(function (g) {
                  return h("li", null, h("a", { href: g.url, target: "_blank", rel: "noopener noreferrer", text: g.title }),
                    h("span", { class: "ready-meta", text: " " + g.by + (g.edition ? ", " + g.edition : "") }));
                })
              : (job.guidance || []).map(function (g) { return h("li", { text: g }); })),
            h("li", { text: "Your own notes, data or the document the draft should be built from." }))),
        job.kind && D.kinds[job.kind]
          ? h("div", { class: "ready" }, h("p", { class: "meta", text: "What you will get: " + D.kinds[job.kind].label.toLowerCase() }),
              h("ul", null, D.kinds[job.kind].produce.map(function (l) { return h("li", { text: l }); })))
          : null),
      step(1, "Your details", profileForm()),
      step(2, "This job", [
        h("p", { class: "note", text: job.gate ? "Nothing you type here is saved. This job is a record: keep names out where you can." : "Nothing you type here is saved. Leave a line blank and the prompt tells the model to ask." }),
        fields,
      ]),
      step(3, "Copy and run it", [
        h("div", { class: "bar" }, copyBtn, h("button", { type: "button", class: "btn ghost", text: "Download .txt", onclick: function () { download(job.id + "-" + job.slug + ".txt", refresh()); } }), starBtn, linkBtn),
        h("details", { class: "preview" }, h("summary", null, "See the full prompt", words), pre),
      ]),
      followUps.length
        ? step(4, "When the draft comes back", [
            h("p", { class: "note", text: "Paste one of these into the same chat. A model checking its own draft can miss things, so check every figure against your source yourself. Then a person with the right role reads the draft before it goes anywhere." }),
            h("ul", { class: "follow" }, followUps.map(function (fu) {
              var b = h("button", { type: "button", class: "btn ghost small", text: "Copy" });
              b.addEventListener("click", function () { copyText(fu.prompt).then(function (ok) { flash(b, ok, "Copy"); }); });
              return h("li", null, h("div", null, h("p", { class: "follow-label", text: fu.label }), h("p", { class: "follow-text", text: fu.prompt })), b);
            })),
          ])
        : null,
      h("div", { class: "related" },
        moments.map(function (m) {
          return h("div", null, h("p", { class: "meta", text: "Part of: " + m.label }),
            h("ol", null, jobsFor(m.slugs).map(function (j) {
              return h("li", null, j.slug === job.slug ? h("strong", { text: j.name }) : h("a", { href: "#/job/" + j.slug, text: j.name }));
            })));
        }),
        nearby.length ? h("div", null, h("p", { class: "meta", text: "More in " + job.category }),
          h("ul", null, nearby.map(function (j) { return h("li", null, h("a", { href: "#/job/" + j.slug, text: j.name })); }))) : null),
    ]);

    document.addEventListener("fsai:profile", onProfile);
    function onProfile() {
      if (!document.body.contains(pre)) return document.removeEventListener("fsai:profile", onProfile);
      refresh();
    }
    refresh();
    window.scrollTo(0, 0);
    h1.focus();
  }

  function step(n, title, body) {
    return h("section", { class: "step" }, h("h2", null, h("span", { class: "num", text: String(n) }), " " + title), body);
  }

  /* ---------- start ---------- */
  var foot = document.getElementById("foot-contact");
  if (C.contact && foot) foot.textContent = C.contact;
  var safetyEl = document.getElementById("foot-safety");
  if (safetyEl && D.safety) {
    add(safetyEl, h("details", { class: "terms" },
      h("summary", { text: "Using it safely: how reliable it is, and seven rules for staff" }),
      h("p", { class: "safety-short", text: D.safety.short }),
      D.safety.sections.map(function (s) {
        var list = h(s.numbered ? "ol" : "ul", null, (s.items || []).map(function (i) { return h("li", { text: i }); }));
        return h("section", null, h("h2", { text: s.heading }), s.intro ? h("p", { text: s.intro }) : null, list, s.outro ? h("p", { text: s.outro }) : null);
      })));
  }
  var termsEl = document.getElementById("foot-terms");
  if (termsEl && D.terms) {
    add(termsEl, [
      h("p", { text: D.terms.summary }),
      h("details", { class: "terms" },
        h("summary", { text: "Terms of use and disclaimer (updated " + D.terms.updated + ")" }),
        D.terms.sections.map(function (s) {
          return h("section", null, h("h2", { text: s.heading }), s.body.map(function (p) { return h("p", { text: p }); }));
        })),
    ]);
  }
  window.addEventListener("hashchange", route);
  route();
})();
