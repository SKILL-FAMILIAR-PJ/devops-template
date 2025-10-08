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

const sanitizeUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    if (url.username || url.password) {
      url.username = "";
      url.password = "";
    }
    return url.toString();
  } catch (error) {
    return "[invalid URL]";
  }
};

const sanitizeMessage = (message) => {
  return message.replace(/https?:\/\/[^:@]+:[^@]+@/g, (match) => {
    const protocol = match.match(/^https?:\/\//)[0];
    return `${protocol}***:***@`;
  });
};

const prepareAuth = (urlString) => {
  try {
    const url = new URL(urlString);
    if (url.username || url.password) {
      const username = decodeURIComponent(url.username);
      const password = decodeURIComponent(url.password);
      const credentials = Buffer.from(`${username}:${password}`).toString(
        "base64"
      );
      url.username = "";
      url.password = "";
      return {
        url: url.toString(),
        authHeader: `Basic ${credentials}`,
      };
    }
    return { url: urlString, authHeader: null };
  } catch (error) {
    return { url: urlString, authHeader: null };
  }
};

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
  return `* **${label}**: ${summary}${extras ? ` (${extras})` : ""}`;
};

const toErrorLine = (id, errorInfo) => {
  const label = linkPattern ? `[${id}](${buildLink(linkPattern, id)})` : id;
  return `* **${label}**: Failed to fetch (${errorInfo})`;
};

const fetchIssue = async (id) => {
  try {
    const rawUrl = buildLink(pattern, id);
    const { url, authHeader } = prepareAuth(rawUrl);

    const headers = {
      Accept: "application/json",
      "User-Agent": "github-actions-teams-notify",
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      return toErrorLine(id, `${response.status} - ${statusText}`);
    }
    const data = await response.json();
    return toLine(id, data);
  } catch (error) {
    return toErrorLine(id, "Network Error");
  }
};

(async () => {
  const results = await Promise.all(ids.map(fetchIssue));
  const lines = results.filter(Boolean);
  if (lines.length) {
    process.stdout.write("**Issues**\n\n".concat(lines.join("\n")));
  }
})().catch((error) => {
  console.error(
    `Issue summary aggregation failed: ${sanitizeMessage(error.message)}`
  );
  process.exit(1);
});
