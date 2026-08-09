/**
 * Strip sensitive query parameters before a URL is written to a log.
 *
 * Several endpoints carry credentials in the query string — the email
 * verification link (?token=), signed storage URLs (?token=&exp=), and the
 * OAuth callback (?code=). Logging request.url verbatim put those into every
 * access log and every 4xx error entry, where they are retained by log
 * aggregators and readable by anyone with log access. An email verification
 * token is an account-takeover primitive for its full 24-hour lifetime.
 */
const SENSITIVE_PARAMS = new Set([
  'token',
  'code',
  'access_token',
  'refresh_token',
  'id_token',
  'state',
  'signature',
  'sig',
  'key',
  'secret',
  'password',
  'api_key',
  'apikey',
]);

/**
 * Normalise a raw parameter name to the form we match against.
 *
 * Handles the variants that would otherwise slip past a naive comparison:
 * percent-encoding (`%74oken`), `+` as an encoded space, surrounding
 * whitespace, PHP-style array suffixes (`token[]`), and case.
 */
function normaliseKey(rawKey: string): string {
  let key = rawKey;
  try {
    key = decodeURIComponent(key.replace(/\+/g, ' '));
  } catch {
    // Malformed percent-encoding: fall back to the raw form.
  }
  return key.trim().toLowerCase().replace(/\[\]$/, '');
}

function redactQuery(query: string): string {
  return query
    .split('&')
    .map((pair) => {
      if (!pair) return pair;
      const eq = pair.indexOf('=');
      const rawKey = eq === -1 ? pair : pair.slice(0, eq);
      if (!SENSITIVE_PARAMS.has(normaliseKey(rawKey))) return pair;
      return `${rawKey}=[REDACTED]`;
    })
    .join('&');
}

export function redactUrl(url: string | undefined): string | undefined {
  if (!url) return url;

  // Split off any fragment first. Fragments are not sent to servers by
  // browsers, but this helper is also used on values that arrive from logs and
  // redirects, where a credential can sit after the '#'.
  const hashStart = url.indexOf('#');
  const hash = hashStart === -1 ? '' : url.slice(hashStart + 1);
  const withoutHash = hashStart === -1 ? url : url.slice(0, hashStart);

  const queryStart = withoutHash.indexOf('?');
  const path = queryStart === -1 ? withoutHash : withoutHash.slice(0, queryStart);
  const query = queryStart === -1 ? null : withoutHash.slice(queryStart + 1);

  let out = path;
  if (query !== null) out += `?${redactQuery(query)}`;
  // A fragment can carry `token=...` in implicit-flow style callbacks.
  if (hash) out += `#${redactQuery(hash)}`;

  return out;
}
