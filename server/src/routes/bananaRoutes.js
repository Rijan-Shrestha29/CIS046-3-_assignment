// Proxy to the external Banana Game API.
// Docs: http://marcconrad.com/uob/banana/api.php
//
// Why proxy at all?
//   The upstream API is served over http:// and 301-redirects. Browsers
//   block cross-origin fetch() after a redirect without the appropriate
//   CORS headers, so calling it directly from the Next.js client fails.
//   Proxying server-to-server side-steps CORS entirely and lets us
//   normalise the response shape.
//
// Theme: Interoperability — this is an adapter between a third-party
// HTTP service and our own API contract.
const express = require('express');

const router = express.Router();

const UPSTREAM = 'https://marcconrad.com/uob/banana/api.php';

// GET /api/banana/question
router.get('/question', async (req, res, next) => {
  try {
    // Node 18+ has global fetch. Use https explicitly.
    const upstream = await fetch(UPSTREAM, {
      headers: { Accept: 'application/json' },
      // Disable Next/Node response caching semantics — every call new question
      cache: 'no-store',
    });

    if (!upstream.ok) {
      res.status(502);
      throw new Error(`Upstream returned ${upstream.status}`);
    }

    const data = await upstream.json();
    // data = { question: "<image url>", solution: <int> }
    if (!data?.question || typeof data?.solution !== 'number') {
      res.status(502);
      throw new Error('Upstream returned an unexpected payload');
    }

    // Return only what the client needs
    res.json({
      question: data.question,
      solution: data.solution,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;