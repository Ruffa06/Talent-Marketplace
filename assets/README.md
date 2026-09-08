# Assets

## `private/` — not in version control

`prototype/talent-marketplace-v2.html` offers two documents for download from
the DJI sections:

| id | file |
|----|------|
| `policy` | `211_2021_P_Developmental_Job_Immersion_v1.0.pdf` |
| `form` | `Annex_1_Developmental_Job_Immersion_Form.pdf` |

Both are marked **Internal — do not distribute outside of the organization** on
every page, and this repository is public, so they live in `assets/private/`,
which `.gitignore` excludes. The committed prototype carries the download UI
with `data: null`; the buttons then say the file is held by HR rather than
serving anything.

The bytes are inlined only when a build targets an audience entitled to see
them — `scripts/build-artifact.py` base64-encodes whatever is in
`assets/private/` into the page it publishes. Put the two files back in that
directory to rebuild.
