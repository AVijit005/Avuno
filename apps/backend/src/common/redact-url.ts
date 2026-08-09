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

export function redactUrl(url: string | undefined): string | undefined {
  if (!url) return url;

  const queryStart = url.indexOf('?');
  if (queryStart === -1) return url;

  const path = url.slice(0, queryStart);
  const query = url.slice(queryStart + 1);

  const redacted = query
    .split('&')
    .map((pair) => {
      if (!pair) return pair;
      const eq = pair.indexOf('=');
      const rawKey = eq === -1 ? pair : pair.slice(0, eq);
      let key: string;
      try {
        key = decodeURIComponent(rawKey).toLowerCase();
      } catch {
        key = rawKey.toLowerCase();
      }
      if (!SENSITIVE_PARAMS.has(key)) return pair;
      return `${rawKey}=[REDACTED]`;
    })
    .join('&');

  return `${path}?${redacted}`;
}
