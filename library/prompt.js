/* School Prompts: builds a prompt from a job, the school profile and this job's answers.
   Plain script, no modules, so the library also runs from a shared drive. */
(function (root) {
  "use strict";
  var D = root.FSAI_DATA;

  function preamble(role, gate) {
    return D.preamble.start + role + D.preamble.end + (gate ? D.preamble.stop : "");
  }

  function fieldsFor(job) {
    return {
      school: D.fields.school,
      extra: (job.fields && D.fields.sets[job.fields]) || [],
      job: D.fields.job,
    };
  }

  function valueFor(field, profile, answers) {
    var own = answers[field.key];
    if (own !== undefined && String(own).trim() !== "") return String(own).trim();
    if (field.profileKey && profile[field.profileKey]) return String(profile[field.profileKey]).trim();
    return "";
  }

  function contextBlock(job, profile, answers) {
    var f = fieldsFor(job);
    var all = f.school.concat(f.extra, f.job);
    var lines = all.map(function (field) {
      var value = valueFor(field, profile, answers);
      if (!value) return "- " + field.label + ":";
      return field.multiline || value.indexOf("\n") !== -1
        ? "- " + field.label + ":\n" + value
        : "- " + field.label + ": " + value;
    });
    return "\nSCHOOL CONTEXT (paste what you have, delete the rest)\n" + lines.join("\n") + "\n\nNow do the job.\n";
  }

  function bullets(lines) {
    return lines.map(function (l) { return "- " + l; }).join("\n");
  }

  /* What the draft must contain and the checks to run, from the job's kind. */
  function standard(job) {
    var kind = job.kind && D.kinds[job.kind];
    if (!kind) return "";
    return "\nProduce:\n" + bullets(kind.produce) + "\n\nBefore you hand it over, check these and fix anything that fails (do not copy this list into the draft):\n" + bullets(kind.check) + "\n";
  }

  function buildPrompt(job, profile, answers) {
    profile = profile || {};
    answers = answers || {};
    var guidance = job.guidance && job.guidance.length
      ? "\nGuidance the user should paste before you draft:\n" + bullets(job.guidance) + "\n" + D.guidance_rule + "\n"
      : "";
    return (
      preamble(job.role, job.gate) +
      guidance +
      "\nJob: " + job.name + "\n\nWhat good looks like:\n" + job.job + "\n" +
      standard(job) +
      contextBlock(job, profile, answers)
    );
  }

  function stem(word) {
    if (word.length > 4 && /ies$/.test(word)) return word.slice(0, -3) + "y";
    if (word.length > 3 && /s$/.test(word) && !/ss$/.test(word)) return word.slice(0, -1);
    return word;
  }

  /** Every typed word (or one of its synonyms) must match; names outrank descriptions. */
  function search(jobs, query) {
    var stop = D.search.stop_words;
    var words = String(query || "")
      .toLowerCase()
      .replace(/[^a-z0-9À-ɏ\s'-]/g, " ")
      .split(/\s+/)
      .filter(function (w) { return w.length > 1 && stop.indexOf(w) === -1; })
      .map(stem);
    if (!words.length) return jobs;
    var scored = [];
    jobs.forEach(function (job) {
      var name = job.name.toLowerCase();
      var text = job.job.toLowerCase();
      var cat = (job.category + " " + job.role).toLowerCase();
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var forms = [word].concat(D.search.synonyms[word] || []);
        var best = 0;
        forms.forEach(function (f) {
          var weight = f === word ? 1 : 0.7;
          if (name.indexOf(f) !== -1) best = Math.max(best, (name.indexOf(f) === 0 ? 12 : 8) * weight);
          else if (cat.indexOf(f) !== -1) best = Math.max(best, 4 * weight);
          else if (text.indexOf(f) !== -1) best = Math.max(best, 2 * weight);
        });
        if (!best) return;
        score += best;
      }
      scored.push({ job: job, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score || (a.job.id < b.job.id ? -1 : 1); });
    return scored.map(function (s) { return s.job; });
  }

  root.FSAI = { buildPrompt: buildPrompt, fieldsFor: fieldsFor, search: search, kinds: D.kinds };
})(typeof window !== "undefined" ? window : this);
