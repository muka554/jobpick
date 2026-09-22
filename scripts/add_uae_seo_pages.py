from pathlib import Path
import json
from html import escape

ROOT = Path(__file__).resolve().parents[1]

CSS = """<style>
:root{--bg:#0A0F14;--panel:#101820;--amber:#FFB020;--teal:#2DD9C0;--ink:#ECE8DE;--dim:#9AA3B1;--line:#263440}*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink)}body{font-family:Inter,Arial,sans-serif;padding:28px 14px 60px}.wrap{max-width:820px;margin:auto}.skip{position:absolute;left:8px;top:-50px;background:var(--amber);color:#171000;padding:10px;border-radius:6px;font-weight:800}.skip:focus{top:8px}.sitenav{display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:30px}.brand{color:var(--teal);font:800 19px Manrope,Arial;text-decoration:none}.links{display:flex;gap:14px;flex-wrap:wrap;font:700 12px 'Barlow Condensed',Arial;text-transform:uppercase;letter-spacing:.08em}.links a{color:var(--dim);text-decoration:none}.links a:hover{color:var(--amber)}.eyebrow{color:var(--amber);font:700 12px 'Barlow Condensed',Arial;text-transform:uppercase;letter-spacing:.18em}h1{font:800 clamp(34px,6vw,58px) Manrope,Arial;line-height:1.06;margin:10px 0 14px}h2{font:800 21px Manrope,Arial;color:var(--teal);margin:32px 0 10px;line-height:1.2}p,li{font-size:16px;line-height:1.75}.lede{font-size:19px;line-height:1.65;color:#D9DFE6}.meta{color:var(--dim);font-size:13px;border-bottom:1px solid var(--line);padding-bottom:16px}.meta a,a{color:var(--amber)}.callout{background:rgba(45,217,192,.07);border:1px solid #2B4F52;border-radius:10px;color:#CFE1E1;padding:15px 17px;line-height:1.65;margin:24px 0}.link-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}.link-card{display:block;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;color:var(--ink);text-decoration:none}.link-card strong{display:block;color:var(--teal);font:800 16px Manrope,Arial;margin-bottom:5px}.link-card span{color:var(--dim);font-size:13px;line-height:1.5}.cta{display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:20px 22px;margin:32px 0 8px;flex-wrap:wrap}.cta strong{font-family:Manrope,Arial}.btn{background:var(--teal);color:#062420;padding:11px 20px;border-radius:8px;text-decoration:none;font-weight:800;white-space:nowrap}footer{border-top:1px solid var(--line);margin-top:40px;padding-top:17px;color:var(--dim);font-size:12px;line-height:1.8}.flinks{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px}.flinks a{color:var(--dim)}@media(max-width:650px){.link-grid{grid-template-columns:1fr}.lede{font-size:17px}}
</style>"""

PAGES = [
    {
        "slug":"jobs-in-uae", "title":"Jobs in the UAE: Search by City, Sector and Role", "description":"Find jobs in the UAE with practical routes for Dubai, Abu Dhabi and other emirates, plus focused guides for IT, customer service, technical support and more.", "eyebrow":"UAE job search hub", "h1":"Jobs in the UAE", "lede":"Use a focused UAE job search instead of one broad query. Start with the city, role family and employer route that match your experience, then verify every vacancy on the original source.",
        "sections":[
            ("Choose a UAE job search route", "The fastest way to make a UAE search useful is to narrow it by location and work. Browse the city guides for <a href=\"/cities/dubai-jobs/\">jobs in Dubai</a> and <a href=\"/cities/abu-dhabi-jobs/\">jobs in Abu Dhabi</a>, then compare the role-specific pages below. Each page is designed for planning and source verification, not to imply that a vacancy is currently open."),
            ("Search by city before applying", "A city label can hide a different worksite, shift pattern or travel expectation. Record the exact office or site, whether the job is on-site or hybrid, the employer domain, and the source date. If the listing does not state enough to judge the location, treat that as a question for the employer rather than an assumption."),
            ("Use employer and public routes together", "Independent boards are useful for discovering employers and role language. For public-sector opportunities, begin with the <a href=\"https://u.ae/en/resources/government-jobs\" target=\"_blank\" rel=\"noopener\">UAE Government jobs directory</a> and follow the active emirate or federal route. For a live vacancy, prefer the employer’s own application page when one is available."),
            ("Prepare a role-specific application", "Use the <a href=\"/guides/uae-cv-guide/\">UAE CV guide</a> to adapt evidence to the role. Save the original URL, employer, location, date found, CV version and any questions. Never add qualifications, visa or availability claims that you cannot support."),
        ],
        "cards":[("Jobs in Dubai","/cities/dubai-jobs/","City guide for employer routes, worksite checks and Dubai Government careers."),("Jobs in Abu Dhabi","/cities/abu-dhabi-jobs/","City guide for public routes, employer research and location checks."),("IT jobs in the UAE","/it-jobs-uae/","Search prompts and evidence ideas for technology roles."),("Customer service jobs in Dubai","/customer-service-jobs-dubai/","A focused route for customer operations, contact-centre and service roles."),("Technical support jobs in the UAE","/technical-support-jobs-uae/","Role-specific search terms and application evidence for support work."),("Sales jobs in the UAE","/sales-jobs-uae/","Plan a sales search around sector, territory, targets and tools.")]
    },
    {
        "slug":"it-jobs-uae", "title":"IT Jobs in the UAE: Technology Roles and Search Guide", "description":"Find IT jobs in the UAE with practical search terms for software, cloud, cybersecurity, data, support and product roles, plus safer application checks.", "eyebrow":"UAE technology careers", "h1":"IT jobs in the UAE", "lede":"A strong IT search connects the role title to a stack, delivery context and city. Use this page to build a specific search for technology work in Dubai, Abu Dhabi and across the UAE.",
        "sections":[
            ("Search by technology discipline", "Try a role family plus a capability: software engineer, cloud engineer, data analyst, cybersecurity analyst, systems administrator, QA engineer, product manager or IT project manager. Add the tools you can evidence, such as a cloud platform, programming language, database, service-management workflow or security control. These are search prompts, not a forecast of open roles."),
            ("Use Dubai and Abu Dhabi context", "For <a href=\"/cities/dubai-jobs/\">Dubai jobs</a>, compare private-sector employer pages with Dubai Government routes where relevant. For <a href=\"/cities/abu-dhabi-jobs/\">Abu Dhabi jobs</a>, check the named worksite and whether the role is office, client, industrial or site based. City and worksite are separate fields in your application log."),
            ("Show evidence, not a keyword list", "A technology CV is more credible when it explains what changed: the system or service, your responsibility, scale, tools, security or reliability constraints, and the result. Keep certifications and years of experience accurate, and link portfolio work only when it is safe to share publicly."),
            ("Verify the original application route", "Use the <a href=\"/jobs/\">live employer listings hub</a> to discover current public-feed roles, but open the original employer page before applying. Check the domain, job reference, location, closing date and contact method. Review the <a href=\"/guides/recruitment-scam-warning-signs/\">recruitment scam warning signs</a> guide before sharing sensitive documents."),
        ],
        "cards":[("UAE jobs hub","/jobs-in-uae/","Return to the city and sector landing-page index."),("Technical support jobs","/technical-support-jobs-uae/","Compare IT support, service desk and customer-facing technical work."),("UAE CV guide","/guides/uae-cv-guide/","Build a role-specific CV with evidence checks."),("Live employer listings","/jobs/","Filter public employer feeds by city and keyword.")]
    },
    {
        "slug":"customer-service-jobs-dubai", "title":"Customer Service Jobs in Dubai: Search and Application Guide", "description":"Find customer service jobs in Dubai with focused search terms for contact centres, retail, hospitality, aviation and customer operations.", "eyebrow":"Dubai customer operations", "h1":"Customer service jobs in Dubai", "lede":"Customer service roles vary by channel, industry, language, shift and site. Use those details to find a realistic match and prepare evidence that an employer can verify.",
        "sections":[
            ("Search by customer channel and sector", "Combine customer service with the work setting: contact centre, front office, retail, hospitality, airline, healthcare, banking, e-commerce or logistics. Add channel terms such as phone, chat, email, social care or complaints. A specific query is more useful than repeating “customer service Dubai” across every board."),
            ("Check shift and location wording", "Dubai roles may be tied to a store, hotel, airport, office, delivery network or client site. Before applying, record the worksite, shift pattern, weekend expectation, transport or language requirement, and whether the employer says the role is on-site, hybrid or remote. Ask for clarification through a legitimate employer contact if the listing is vague."),
            ("Show service outcomes", "Replace generic claims such as “excellent communication” with evidence: interaction volume, response-time targets, resolution rate, quality scores, systems used, escalation handling, languages used and the type of customer served. Keep figures accurate and explain the period or team context."),
            ("Keep applications safe", "Find roles through the <a href=\"/jobs/\">live listings hub</a> or a reputable platform, then verify the original employer page. Never pay to obtain an interview, and do not send banking credentials or identity documents to an unverified contact. The <a href=\"/cities/dubai-jobs/\">Dubai jobs guide</a> adds city-search context."),
        ],
        "cards":[("Jobs in Dubai","/cities/dubai-jobs/","City-specific planning and official route context."),("IT jobs in the UAE","/it-jobs-uae/","A related page for service desk and technology roles."),("UAE CV guide","/guides/uae-cv-guide/","Make customer and language evidence easy to verify."),("Recruitment safety","/guides/recruitment-scam-warning-signs/","Check a new recruiter or vacancy before sharing documents.")]
    },
    {
        "slug":"technical-support-jobs-uae", "title":"Technical Support Jobs in the UAE: Search Guide", "description":"Find technical support jobs in the UAE across service desk, field support, application support and customer-facing technology roles.", "eyebrow":"UAE support careers", "h1":"Technical support jobs in the UAE", "lede":"Technical support work sits between systems and people. Search by support level, product, environment and city, then show how you diagnose and resolve issues in real conditions.",
        "sections":[
            ("Choose the right support lane", "Search separately for service desk, desktop support, field support, application support, NOC, network support, cloud support and technical account support. Add the environment or product where relevant: SaaS, enterprise software, retail systems, healthcare, telecoms, logistics or managed services."),
            ("Make the city and worksite explicit", "Use <a href=\"/cities/dubai-jobs/\">Dubai</a> and <a href=\"/cities/abu-dhabi-jobs/\">Abu Dhabi</a> as starting points, but read the worksite detail. Field and client-facing support can involve travel, shifts, site access or an employer vehicle. Keep those requirements separate from the job title when deciding whether to apply."),
            ("Explain your troubleshooting method", "Show the evidence behind support claims: ticket volume, priority or SLA handling, diagnostic steps, root-cause notes, escalation quality, knowledge-base work, monitoring, device or endpoint scope, and the tools used. Do not list a platform as experience unless you can explain what you did with it."),
            ("Verify role freshness and ownership", "Use <a href=\"/jobs/\">current employer listings</a> to discover roles, then confirm the original application page and employer domain. If the same posting appears in several places, use duplicates to compare dates and wording, not to submit repeated applications."),
        ],
        "cards":[("IT jobs in the UAE","/it-jobs-uae/","Broader technology search terms and evidence guidance."),("Jobs in Abu Dhabi","/cities/abu-dhabi-jobs/","Worksite and public-route context for Abu Dhabi."),("Jobs in Dubai","/cities/dubai-jobs/","City guide with employer and location checks."),("Live listings","/jobs/","Browse employer-published roles by city and keyword.")]
    },
    {
        "slug":"sales-jobs-uae", "title":"Sales Jobs in the UAE: Search by Sector and Territory", "description":"Find sales jobs in the UAE with practical search terms for account management, business development, retail, SaaS, real estate and sales operations.", "eyebrow":"UAE commercial careers", "h1":"Sales jobs in the UAE", "lede":"Sales titles vary widely across sectors. Narrow a UAE search by customer, territory, sales motion and evidence of results rather than relying on a generic sales keyword.",
        "sections":[
            ("Search by sales motion", "Try account executive, business development, account manager, key account manager, sales development, partnerships, retail sales, pre-sales or sales operations. Add the context you understand: SaaS, logistics, real estate, hospitality, financial services, industrial products or professional services."),
            ("Define the territory and customer", "A role can be based in Dubai or Abu Dhabi while serving customers across the UAE or wider Gulf. Read whether the job is inbound, outbound, field based, partner led or enterprise focused. Record travel, client-site expectations, language requirements and the named market before applying."),
            ("Show credible commercial evidence", "A useful sales CV explains the period, segment, product, sales cycle, quota or target context, average deal or account scope, pipeline work and the actions behind the result. Avoid unsupported revenue claims or inflated percentages; employers may test the details in interview."),
            ("Link the search to employer sources", "Use the <a href=\"/jobs/\">live listings hub</a> and <a href=\"/jobs-in-uae/\">UAE jobs hub</a> to organize discovery, then verify the employer’s original vacancy. For city-specific planning, read the <a href=\"/cities/dubai-jobs/\">Dubai jobs guide</a> or <a href=\"/cities/abu-dhabi-jobs/\">Abu Dhabi jobs guide</a>."),
        ],
        "cards":[("UAE jobs hub","/jobs-in-uae/","Browse all UAE city and role landing pages."),("Jobs in Dubai","/cities/dubai-jobs/","Plan a Dubai search around employer and worksite context."),("Jobs in Abu Dhabi","/cities/abu-dhabi-jobs/","Compare Abu Dhabi routes and location wording."),("UAE CV guide","/guides/uae-cv-guide/","Turn targets and account evidence into a verifiable CV.")]
    },
]

def page_html(page):
    url = f"https://jobpick20.com/{page['slug']}/"
    cards = ''.join(f'<a class="link-card" href="{href}"><strong>{escape(title)}</strong><span>{escape(desc)}</span></a>' for title, href, desc in page['cards'])
    sections = ''.join(f'<h2>{heading}</h2><p>{body}</p>' for heading, body in page['sections'])
    schema = json.dumps({"@context":"https://schema.org","@type":"Article","headline":page['h1'],"description":page['description'],"mainEntityOfPage":{"@type":"WebPage","@id":url},"author":{"@type":"Organization","name":"Middle East Job Hub Editorial Team"},"publisher":{"@type":"Organization","name":"Middle East Job Hub"},"datePublished":"2026-09-22","dateModified":"2026-09-22T00:00:00+04:00"}, ensure_ascii=False, separators=(',', ':'))
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(page['title'])} | Middle East Job Hub</title>
<meta name="description" content="{escape(page['description'])}"><link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#0A0F14">
<meta property="og:type" content="article"><meta property="og:site_name" content="Middle East Job Hub"><meta property="og:title" content="{escape(page['title'])} | Middle East Job Hub"><meta property="og:description" content="{escape(page['description'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://jobpick20.com/assets/middle-east-job-hub-logo.png"><meta property="og:image:alt" content="Middle East Job Hub logo">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{escape(page['title'])} | Middle East Job Hub"><meta name="twitter:description" content="{escape(page['description'])}"><meta name="twitter:image" content="https://jobpick20.com/assets/middle-east-job-hub-logo.png">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="64x64" href="/assets/middle-east-job-hub-logo-64.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;600;700&family=Manrope:wght@700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">{schema}</script>
{CSS}<script src="/assets/privacy-controls.js?v=20260827cmp2" defer></script><script src="/assets/site-localization.js?v=20260827perf1" defer></script></head>
<body><a class="skip" href="#main-content">Skip to main content</a><div class="wrap"><nav class="sitenav" aria-label="Site"><a class="brand" href="/"><img src="/assets/middle-east-job-hub-logo-64.webp" width="28" height="28" alt="" decoding="async">MIDDLE EAST JOB HUB</a><div class="links"><a href="/">Home</a><a href="/jobs/">Jobs</a><a href="/resources/">Resources</a><a href="/employers/">For employers</a><a href="/tools/">Tools</a><a href="/about/">About</a><a href="/contact/">Contact</a></div></nav>
<main id="main-content" tabindex="-1"><div class="eyebrow">{escape(page['eyebrow'])}</div><h1>{escape(page['h1'])}</h1><p class="meta">By <a href="/authors/jobpick-editorial-team/">Middle East Job Hub Editorial Team</a> · Last reviewed: September 22, 2026 · Informational guidance</p><p class="lede">{page['lede']}</p>{sections}<div class="callout"><strong>Source and safety note:</strong> JobPick links to public platforms and employer routes; it does not recruit, guarantee a vacancy, or decide eligibility. Verify the employer, role, worksite and application requirements on the original source before applying.</div><h2>Related UAE job searches</h2><div class="link-grid">{cards}</div><div class="cta"><strong>Ready to compare current employer listings?</strong><a class="btn" href="/jobs/">Open live job listings →</a></div></main>
<footer><p>© 2026 Middle East Job Hub. Independent job-search guidance and links to external sources.</p><div class="flinks"><a href="/">Home</a><a href="/jobs/">Jobs</a><a href="/resources/">Resources</a><a href="/about/">About</a><a href="/privacy-policy/">Privacy</a><a href="/contact/">Contact</a></div></footer></div></body></html>'''

for page in PAGES:
    target = ROOT / page['slug'] / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page_html(page) + '\n', encoding='utf-8')

for slug, related in {
    'cities/dubai-jobs/index.html': '<h2>Related UAE job searches</h2><p>Continue with <a href="/jobs-in-uae/">jobs in the UAE</a>, <a href="/it-jobs-uae/">IT jobs in the UAE</a>, or <a href="/customer-service-jobs-dubai/">customer service jobs in Dubai</a> when you are ready to narrow the role.</p>',
    'cities/abu-dhabi-jobs/index.html': '<h2>Related UAE job searches</h2><p>Continue with <a href="/jobs-in-uae/">jobs in the UAE</a>, <a href="/it-jobs-uae/">IT jobs in the UAE</a>, or <a href="/technical-support-jobs-uae/">technical support jobs in the UAE</a> when you are ready to narrow the role.</p>'
}.items():
    path = ROOT / slug
    text = path.read_text(encoding='utf-8')
    text = text.replace('rel="canonical" href="https://jobpick20.com/cities/dubai-jobs/"\n', 'rel="canonical" href="https://jobpick20.com/cities/dubai-jobs/">\n')
    text = text.replace('rel="canonical" href="https://jobpick20.com/cities/abu-dhabi-jobs/"\n', 'rel="canonical" href="https://jobpick20.com/cities/abu-dhabi-jobs/">\n')
    text = text.replace('content="https://jobpick20.com/assets/middle-east-job-hub-logo.png">>', 'content="https://jobpick20.com/assets/middle-east-job-hub-logo.png">')
    while text.count('<h2>Related UAE job searches</h2>') > 1:
        second = text.find('<h2>Related UAE job searches</h2>', text.find('<h2>Related UAE job searches</h2>') + 1)
        cta = text.find('<div class="cta">', second)
        text = text[:second] + text[cta:]
    if '<h2>Related UAE job searches</h2>' not in text:
        text = text.replace('<div class="cta"><strong>Ready to turn the plan into a focused search?</strong>', related + '<div class="cta"><strong>Ready to turn the plan into a focused search?</strong>')
    path.write_text(text, encoding='utf-8')

# Add a crawlable UAE cluster to the homepage and the resources hub.
home = ROOT / 'index.html'
h = home.read_text(encoding='utf-8')
marker = '    <h2 id="resourcesHeading" data-i18n="resources.heading">Job-search resources</h2>'
block = '''    <h2>UAE job searches by city and role</h2>
    <p class="resources-intro">Build a more specific search with our UAE landing pages. Each page links city context, role evidence, live employer listings, and safer source checks.</p>
    <div class="resources-grid"><a class="rescard" href="/jobs-in-uae/"><strong>Jobs in the UAE</strong><br><span style="font-size:13px;color:var(--ink-dim);font-weight:500;display:inline-block;margin-top:6px;">Browse city and role-specific UAE search routes.</span></a><a class="rescard" href="/it-jobs-uae/">IT jobs in the UAE</a><a class="rescard" href="/customer-service-jobs-dubai/">Customer service jobs in Dubai</a><a class="rescard" href="/technical-support-jobs-uae/">Technical support jobs in the UAE</a><a class="rescard" href="/sales-jobs-uae/">Sales jobs in the UAE</a><a class="rescard" href="/cities/dubai-jobs/">Jobs in Dubai</a><a class="rescard" href="/cities/abu-dhabi-jobs/">Jobs in Abu Dhabi</a></div>
'''
if marker in h and 'UAE job searches by city and role' not in h:
    h = h.replace(marker, block + marker)
home.write_text(h, encoding='utf-8')

resources = ROOT / 'resources/index.html'
r = resources.read_text(encoding='utf-8')
marker = '<h2>Country, CV, platform, and safety guides</h2>'
block = '''<h2>UAE job searches by city and role</h2><p>Use these focused landing pages to move from a broad keyword to a city, sector and evidence-led application plan.</p><div class="grid"><a class="card" href="/jobs-in-uae/"><strong>Jobs in the UAE</strong><span>City and sector routes for a more specific search.</span></a><a class="card" href="/it-jobs-uae/"><strong>IT jobs in the UAE</strong><span>Technology role families, search terms and evidence ideas.</span></a><a class="card" href="/customer-service-jobs-dubai/"><strong>Customer service jobs in Dubai</strong><span>Channel, sector, shift and worksite checks.</span></a><a class="card" href="/technical-support-jobs-uae/"><strong>Technical support jobs in the UAE</strong><span>Support lanes, troubleshooting evidence and source checks.</span></a><a class="card" href="/sales-jobs-uae/"><strong>Sales jobs in the UAE</strong><span>Search by sector, territory, customer and sales motion.</span></a></div>
'''
if marker in r and 'UAE job searches by city and role' not in r:
    r = r.replace(marker, block + marker)
resources.write_text(r, encoding='utf-8')

jobs = ROOT / 'jobs/index.html'
j = jobs.read_text(encoding='utf-8')
jobs_block = '<section class="method"><h2>Search guides for UAE roles and cities</h2><p>Use the <a href="/jobs-in-uae/">UAE jobs hub</a> to narrow a broad search, then open the <a href="/cities/dubai-jobs/">Dubai jobs guide</a>, <a href="/cities/abu-dhabi-jobs/">Abu Dhabi jobs guide</a>, <a href="/it-jobs-uae/">IT jobs guide</a>, <a href="/customer-service-jobs-dubai/">customer service guide</a>, or <a href="/technical-support-jobs-uae/">technical support guide</a> for application planning and source checks.</p></section>'
if 'Search guides for UAE roles and cities' not in j:
    j = j.replace('</main>', jobs_block + '</main>')
jobs.write_text(j, encoding='utf-8')

# Add the new canonical URLs to the XML sitemap.
sitemap = ROOT / 'sitemap.xml'
s = sitemap.read_text(encoding='utf-8')
new_urls = [p['slug'] for p in PAGES]
insert = ''.join(f'''  <url>\n    <loc>https://jobpick20.com/{slug}/</loc>\n    <lastmod>2026-09-22</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n''' for slug in new_urls)
if 'https://jobpick20.com/jobs-in-uae/' not in s:
    s = s.replace('</urlset>', insert + '</urlset>')
sitemap.write_text(s, encoding='utf-8')
print(f'Generated {len(PAGES)} UAE landing pages and updated city metadata, internal links, and sitemap.')
