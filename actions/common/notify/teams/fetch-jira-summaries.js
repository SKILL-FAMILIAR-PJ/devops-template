const pattern = process.env.ISSUE_SUMMARY_PATTERN || "";
const linkPattern = process.env.ISSUE_LINK_PATTERN || "";
const changelog = process.env.CHANGELOG_CONTENT || "";

const issueRegex = /\*\*\[?([A-Z][A-Z0-9]+-\d+)/g;
const ids = Array.from(
  new Set(Array.from(changelog.matchAll(issueRegex), (match) => match[1]))
);

if (!pattern || ids.length === 0) {
  process.exit(0);
}

const buildLink = (template, id) =>
  template.replace(/\$\{id\}/g, encodeURIComponent(id));

const toLine = (id, data) => {
  if (!data || !data.fields || !data.fields.summary) return null;
  const summary = data.fields.summary;
  const status =
    data.fields.status && data.fields.status.name
      ? data.fields.status.name
      : "";
  const type =
    data.fields.issuetype && data.fields.issuetype.name
      ? data.fields.issuetype.name
      : "";
  const label = linkPattern ? `[${id}](${buildLink(linkPattern, id)})` : id;
  const extras = [status, type].filter(Boolean).join(" · ");
  return `* **${label}** — ${summary}${extras ? ` (${extras})` : ""}`;
};

const fetchIssue = async (id) => {
  try {
    const url = buildLink(pattern, id);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "github-actions-teams-notify",
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch ${id}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return toLine(id, data);
  } catch (error) {
    console.error(`Failed to fetch ${id}: ${error.message}`);
    return null;
  }
};

(async () => {
  const results = await Promise.all(ids.map(fetchIssue));
  const lines = results.filter(Boolean);
  if (lines.length) {
    process.stdout.write(lines.join("\n"));
  }
})().catch((error) => {
  console.error(`Issue summary aggregation failed: ${error.message}`);
  process.exit(1);
});
