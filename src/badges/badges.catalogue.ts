export type BadgeTier = 'none' | 'bronze' | 'gold';

export type BadgeCatalogueEntry = {
  slug: string;
  track: string;
  tier: BadgeTier;
  cap?: number;
};

// Static definition of every badge BureauOS can issue. This is the single
// source of truth seeded into `BadgeDefinition` — FE/Mobile keep their own
// copy of the *display* metadata (glyph, label) keyed by the same slugs.
export const BADGE_CATALOGUE: BadgeCatalogueEntry[] = [
  // T1 — Founding cohort (closed, issued once, capped at 100 each)
  { slug: 'founding-member', track: 'founding-cohort', tier: 'gold', cap: 100 },
  {
    slug: 'founding-advisor',
    track: 'founding-cohort',
    tier: 'bronze',
    cap: 100,
  },

  // T2 — Compliance & audit readiness
  { slug: 'audit-ready', track: 'compliance-audit-readiness', tier: 'none' },
  { slug: 'zero-penalty', track: 'compliance-audit-readiness', tier: 'none' },
  {
    slug: 'clean-cap-table',
    track: 'compliance-audit-readiness',
    tier: 'none',
  },
  {
    slug: 'board-ready-data-room',
    track: 'compliance-audit-readiness',
    tier: 'none',
  },

  // T3 — Growth & cross-border scale
  {
    slug: 'cross-border-pioneer',
    track: 'growth-cross-border-scale',
    tier: 'none',
  },
  {
    slug: 'multi-entity-operator',
    track: 'growth-cross-border-scale',
    tier: 'none',
  },

  // T4 — Relationship & network
  { slug: 'high-trust-connector', track: 'relationship-network', tier: 'none' },
  {
    slug: '5-star-governance-partner',
    track: 'relationship-network',
    tier: 'none',
  },
  { slug: 'ecosystem-architect', track: 'relationship-network', tier: 'none' },

  // T5 — Knowledge base & attribution
  {
    slug: 'workflow-contributor',
    track: 'knowledge-base-attribution',
    tier: 'none',
  },
  {
    slug: 'compliance-architect',
    track: 'knowledge-base-attribution',
    tier: 'none',
  },
  {
    slug: 'regulatory-sentinel',
    track: 'knowledge-base-attribution',
    tier: 'none',
  },
  {
    slug: 'jurisdiction-specialist',
    track: 'knowledge-base-attribution',
    tier: 'none',
  },

  // T6 — Longevity & standing
  { slug: 'early-filer', track: 'longevity-standing', tier: 'none' },
  { slug: 'continuous-standing', track: 'longevity-standing', tier: 'none' },
];

export const CAPPED_BADGE_SLUGS = BADGE_CATALOGUE.filter((b) => b.cap).map(
  (b) => b.slug,
);
