"""Builds options/<n>/index.html from seed/index.html: one markup edit per option, plus a link to that option's CSS."""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
seed = (ROOT / "seed/index.html").read_text()

OLD_ROLE = ('<span class="info-role">Engineering Leader <span class="info-sep">|</span> Design Engineering, '
            'Frontend Systems &amp; Developer Experience</span>')
OLD_BIO = ("Designer turned engineer turned engineering leader. For 18 years, I&#x27;ve built frontend platforms, "
           "design systems, and developer experiences. I&#x27;ve also led the teams behind them.")
NAME_END = '</div></div><div class="details">'  # end of .dims, end of .name-block, start of .details
TAGLINE_END = 'behind the work.</span></p>'
assert OLD_ROLE in seed and OLD_BIO in seed and NAME_END in seed and TAGLINE_END in seed

ROLES = ["Engineering Leader", "Frontend Architecture", "Design Engineering", "Developer Experience"]
lis = "".join(f"<li>{r}</li>" for r in ROLES)
STATUS_ONLY = ""  # the strip keeps only "Open to new roles"

def roles_ul(cls, b):
    return f'<ul class="{cls}" aria-label="Roles" style="--_b:{b}" data-build="true">{lis}</ul>'

options = {
    # 1. The strip stays; the role becomes a list of four with square bullets.
    "1": lambda h: h.replace('<p class="info"', '<div class="info"', 1)
                    .replace(OLD_ROLE, f'<ul class="info-roles" aria-label="Roles">{lis}</ul>')
                    .replace('Open to new roles</span></span></p>', 'Open to new roles</span></span></div>', 1),
    # 2. The roles sit right under the name, before the tagline.
    "2": lambda h: h.replace(OLD_ROLE, STATUS_ONLY).replace(NAME_END, '</div></div>' + roles_ul("roles", 1.5) + '<div class="details">'),
    # 3. The roles are woven into the bio and marked so they scan.
    "3": lambda h: h.replace(OLD_ROLE, STATUS_ONLY).replace(OLD_BIO,
            'Designer turned engineer turned <strong class="bio-role">engineering leader</strong>. For 18 years, '
            'I&#x27;ve worked across <strong class="bio-role">frontend architecture</strong>, '
            '<strong class="bio-role">design engineering</strong>, and <strong class="bio-role">developer experience</strong>. '
            'I&#x27;ve built the platforms and design systems, and led the teams behind them.'),
    # 4. A small labelled list in the details row, under the tagline.
    "4": lambda h: h.replace(OLD_ROLE, STATUS_ONLY).replace(TAGLINE_END, TAGLINE_END +
            '<dl class="roles" style="--_b:2.5" data-build="true"><dt>Roles</dt>' + "".join(f"<dd>{r}</dd>" for r in ROLES) + '</dl>'),
}

for n, edit in options.items():
    html = edit(seed)
    assert html != seed
    html = html.replace('"_astro/', '"../../seed/_astro/').replace('"fonts/', '"../../seed/fonts/')
    html = html.replace("</head>", '  <link rel="stylesheet" href="option.css">\n</head>', 1)
    (ROOT / f"options/{n}/index.html").write_text(html)
    print("wrote", n)
