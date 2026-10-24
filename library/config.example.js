/*
  School Prompts settings for your school.

  Copy this file to config.js (in the same folder) and edit it. Your config.js
  is never overwritten when you update the library. Everything is optional:
  delete a line to use the default.

  Nothing here is secret and nothing is sent anywhere. Do not put pupil or
  staff personal data in this file.
*/
window.FSAI_CONFIG = {
  // The heading staff see at the top of the page.
  title: "Prompt library",

  // One or two sentences under the heading.
  intro: "Prompts for the drafts we write every week. Fill in what you know, copy the prompt, and check the draft before it goes anywhere.",

  // Your school's details, filled into every prompt for every member of staff.
  // The library is for schools in England only.
  school: {
    school: "",       // e.g. "Samplefold Community Primary School"
    phase: "",        // e.g. "Maintained primary, ages 3 to 11"
    community: "",    // e.g. "312 on roll, rural, Church of England"
    tone: "",         // e.g. "Warm and plain"
  },

  // true: staff cannot change the school details above (they can still set
  // their own role, subjects and year groups).
  lockSchool: false,

  // Which AI tool staff should use. Shown at the top of the page and on every job.
  // e.g. "Use Microsoft 365 Copilot Chat, signed in with your school account."
  modelAdvice: "",

  // Shown on jobs marked Record (safeguarding, HR, references, health plans and so on).
  // e.g. "Record jobs: only in the school's approved tool, never a public chat. Ask the DSL or DPO first."
  recordAdvice: "",

  // true: hide the jobs marked Record altogether.
  hideRecordJobs: false,

  // Categories to hide, by name, e.g. ["Sixth form", "GCSE"] in a primary school.
  hideCategories: [],

  // Who to ask about using AI at your school. Shown in the footer.
  // e.g. "Questions: Jo Bloggs, data protection lead, via the staff helpdesk."
  contact: "",

  // Your own jobs, shown on a "Our school" shelf. Each needs a name and a job.
  // gate: true marks it as a Record. guidance: things staff should paste first.
  // kind (optional) adds the library's standard structure and checks, one of:
  // map, revision, lesson, resource, feedback, message, copy, paper, plan, policy,
  // record, people, brief, analysis, evaluation, support, profile,
  // conversation, observation, risk, script, coach.
  customJobs: [
    // {
    //   name: "Weekly bulletin item",
    //   job: "Write a 120-word item for the Friday staff bulletin from the notes pasted. Plain, warm, one action.",
    //   role: "a member of school staff",
    //   gate: false,
    //   kind: "message",
    //   guidance: ["Our bulletin style guide"]
    // }
  ]
};
