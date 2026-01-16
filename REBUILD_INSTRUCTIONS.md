# 8020films.com Website Rebuild Instructions

## General Context

We're migrating content from an old website (bombiefilms.com) to a new structure on 8020films.com.
The site is a **multi-lingual marketing site** for 8020 Films, a film production company.

### Languages
- English (primary)
- French

### Tech Stack
- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl (already configured)
- **Database**: Supabase (project: "8020 Films website" - `lgoffwknqixzrpdpulbn`)
- **Storage**: Supabase Storage (for images and media)
- **State**: Zustand
- **Forms**: Zod validation + reCAPTCHA v3

---

## Data Storage Strategy

| Content Type | Storage | Reasoning |
|--------------|---------|-----------|
| Static UI text (nav, buttons, labels) | Local JSON files via next-intl | Fast, no DB calls, version controlled |
| Work references (projects) | Supabase DB | Admin CRUD, dynamic content |
| Editable page text blocks | Supabase DB | Admin can update without code deploy |
| Form submissions (quotes) | Supabase DB | Audit trail + triggers email notification |
| Newsletter signups | Supabase DB | Admin can view/export in portal |
| Images & media | Supabase Storage | Centralized, admin uploadable |

---

## Assets

- White logo: `public/img/logo-8020Films-horizontal_white_1000px.png`
- Black logo: `public/img/logo-8020Films-horizontal_black_1000px.png`

---

## Design Guidelines

### Design Reference
https://grandcrew.work

### Layout/Blocks Reference
https://portfoliowp.com/demo/

### Typography
- **Body font**: Open Sans
- **Title font**: Open Sans, all caps, bold

### Colors
- White
- Off-black
- Grey
- Bluish hues
- Most color comes from images/media

### Style Keywords
Modern, flat, edgy, cool, authentic, simple

---

## Site Structure

### Header
Logo (8020films) followed by navigation:
| English | French |
|---------|--------|
| Work | Projets |
| Careers | Recrutement |
| Get a quote | Obtenir un devis |

### Footer
- Instagram (icon link)
- LinkedIn (icon link)
- Newsletter signup (email input field, stores to Supabase DB)
- Contact us (links to Get a quote page)
- Login (links to admin portal)

---

## Pages to Build

1. Homepage
2. Work (portfolio listing)
3. Work reference pages (one per project, dynamic)
4. Careers
5. Get a quote
6. Admin portal (login + dashboard)

---

## Page Specifications

### Homepage

#### Hero Section (above the fold)
- **Video background**: https://vimeo.com/950307098/01466759b3?share=copy
- **Overlapping text block** (bottom left of video):
  > Based in Paris, London & Los Angeles we can unlock video production for you anywhere in the world with our teams of vetted, hand-selected crews. Best-in-class content for some of the world's most renowned agencies and brands.
- **CTA button**: "Get a quote" (scrolls to quote form at bottom of page)

#### Some of Our Work Section
- 9 thumbnails tiled (reference: https://portfoliowp.com/demo/pages/portfolio-template-pro/)
- 5 thumbnails on mobile
- Use first 9 references from WORK_REFERENCES.md
- **Button**: "View all our work" → links to Work page

#### Capabilities Section
Design reference: https://portfoliowp.com/demo/ (Capabilities block)

6 capabilities to display:

1. **Scope & Budget Alignment**
   Work with you to define clear project scope and align budgets before production begins.

2. **Full Service Production**
   Source complete crews including DP, lighting, gaffer, makeup, post-production, and animation.

3. **Live Streaming & Events**
   From festivals and concerts to corporate conferences, we deliver flawless live broadcasts.

4. **Music**
   Music videos, concert films, and artist content that captures the energy of live performance.

5. **Brand Storytelling**
   Compelling narratives that connect your brand with audiences through authentic visual content.

6. **Remote Production**
   With our connected film kits, supervise shoots remotely from anywhere in the world.

#### Case Study Section
- Layout reference: https://portfoliowp.com/demo/ (case study block)
- Display one or more featured case studies (admin-selectable in back office)
- Default: use first work reference from "Some of our work" block

#### Get a Quote Section
- Layout reference: https://portfoliowp.com/demo/ (contact section)
- **Header text**: "Get a quote! Our average reply time is within the hour."
- Form fields (see detailed spec in Get a Quote page section)

---

### Work Page

#### Description
Portfolio listing page with category filter buttons for fluid filtering.

#### Design Reference
https://grandcrew.work/Projects-Index-All (harmonize with site design)

#### Filter Categories
- Corp & Brand storytelling
- Live streaming & events
- Music
- Remote production

All work references should be tagged with one or more of these categories.

---

### Work Reference Pages (Dynamic)

#### Description
One page per work reference, dynamically generated from database.

#### Data Source
All work references listed in WORK_REFERENCES.md need to be imported to Supabase DB with:
- Multi-language support (EN/FR)
- Images stored in Supabase Storage
- Video embeds (Vimeo/YouTube)

#### Design
Simple layout similar to homepage case study block.
Reference: https://portfoliowp.com/demo/ (case study layout)

#### Content Structure per Reference
- Title
- Client name
- Category tags
- Featured image
- Excerpt (short description)
- Body content (business challenge, solution, value delivered)
- Video embed(s)
- Image gallery

---

### Careers Page

#### Description
Simple page with hiring information.

#### Content
- Brief blurb about working at 8020 Films
- Contact email for inquiries: hello@8020films.com
- (Future consideration: job listings from DB)

---

### Get a Quote Page

#### Description
Contact page with company blurb and quote request form.

#### Layout Reference
https://mgempower.com/contact/

#### Blurb Content
> With teams across three continents in some of the world's most vibrant cities, we're probably closer than you think. We're all about those face-to-face meetings where ideas flow more freely than the coffee.
>
> Drop us a line with your ideas and we'll get back to you with a quote.
> Reach out today, and let's create something unforgettable together.
>
> **Want to write?**
> hello@8020films.com

#### Form Header
"Get a quote! Our average reply time is within the hour."

#### Form Fields

| Field | Type | Required |
|-------|------|----------|
| Your Company | text | Yes |
| First name | text | Yes |
| Last name | text | Yes |
| Work email | email | Yes |
| Job title | text | Yes |
| Project type | dropdown | No |
| Budget range | dropdown | No |
| Message (what's the brief?) | textarea | Yes |
| Anything else we should know? | textarea | No |
| How did you hear about us? | dropdown | No |

**Project Type Options:**
- Financial storytelling
- Corporate video
- Brand storytelling
- Remote production
- Live streaming & events
- Music
- Other

**Budget Range Options:**
- Not sure
- Under $5k
- $5k-$10k
- $10k-$50k
- $50k-$100k
- $100k and up

**How did you hear about us? Options:**
- Referral
- Online search
- Social Media
- Live event
- Partner website
- Press article
- Other

#### Form Handling
1. Validate with Zod
2. Verify with reCAPTCHA v3 (invisible, score-based)
3. Store submission in Supabase DB
4. Send email notification to hello@8020films.com via Supabase Edge Function

---

### Admin Portal

#### Access
- Login link in footer
- Single admin role (future: employee/contractor roles)

#### Authentication
Supabase Auth with email/password

#### Admin Features

1. **Page Text Management**
   - Edit editable text blocks on various pages
   - Support for multiple languages (EN/FR)

2. **Work References Management**
   - Add/edit/delete work references
   - Multi-language content (EN/FR)
   - Image upload to Supabase Storage
   - Category assignment
   - Video embed URLs

3. **Homepage Configuration**
   - Select which work references appear on homepage (top 9 for desktop, top 5 for mobile)
   - Visual ordering/drag-drop
   - Select featured case study/studies

4. **Newsletter Subscribers**
   - View list of newsletter signups
   - Export functionality

5. **Quote Submissions** (recommended addition)
   - View incoming quote requests
   - Mark as read/handled

---

## Newsletter Signup

- Email input field in footer
- Stores subscriber email to Supabase DB (with timestamp)
- Admin can view/export subscribers in admin portal
- Optional: send confirmation email

---

## Technical Notes

### Email Sending
Use Supabase Edge Function with a transactional email service (Resend recommended) for:
- Quote form notifications to hello@8020films.com
- Optional newsletter confirmation emails

### Image Migration
All images referenced from bombiefilms.com in WORK_REFERENCES.md need to be:
1. Downloaded
2. Uploaded to Supabase Storage
3. URLs updated in database

### SEO
- Each page should have proper meta tags
- Work reference pages should have dynamic OG images
- Sitemap generation

### Performance
- Image optimization via Next.js Image component
- Video lazy loading
- Consider ISR for work reference pages

---

## Work Reference Categories Mapping

Map existing categories from WORK_REFERENCES.md to the 4 filter categories:

| Original Category | Maps To |
|-------------------|---------|
| Narrative & Brand Storytelling | Corp & Brand storytelling |
| Corporate | Corp & Brand storytelling |
| Financial Storytelling | Corp & Brand storytelling |
| Live Streaming & Events | Live streaming & events |
| Music | Music |
| Remote production | Remote production |

---

## Implementation Order (Suggested)

1. Database schema setup (Supabase)
2. Import work references to DB
3. Migrate images to Supabase Storage
4. Homepage
5. Work page + dynamic work reference pages
6. Get a quote page + form handling
7. Careers page
8. Admin portal
9. Newsletter functionality
10. Polish, SEO, testing
