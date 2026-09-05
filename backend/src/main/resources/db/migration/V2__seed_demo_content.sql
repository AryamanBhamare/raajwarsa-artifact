-- Demo content so a fresh deployment is immediately browsable.
-- Idempotent: unique-slug conflicts are skipped, so re-running the app or
-- applying this migration on a populated database never duplicates rows.

-- Helper: categories referenced by slug so id ordering never matters.
INSERT INTO artifacts (
    name, slug, category_id, description,
    material, period, region, availability,
    featured, active, sort_order,
    created_at, updated_at
)
SELECT
    v.name, v.slug, c.id, v.description,
    v.material, v.period, v.region, v.availability,
    v.featured, TRUE, v.sort_order,
    NOW(), NOW()
FROM (VALUES
    ('Maratha Pattern Bronze Kavacha Vessel',           'maratha-pattern-bronze-kavacha-vessel',          'maratha-heritage',           'A bronze vessel with a finely patterned surface, associated with the Maratha era.',                  'Bronze',        '19th Century',           'Deccan',                    'ON_REQUEST',    TRUE,  1),
    ('Iron Tulwar with Bronze Overlay',                 'iron-tulwar-with-bronze-overlay',                'maratha-heritage',           'A tulwar with an iron blade and bronze overlay, in the Deccan tradition.',                            'Iron, Bronze',  '18th-19th Century',      'Deccan',                    'ON_REQUEST',    FALSE, 2),
    ('Detail Panel - Fort Sculpture',                   'detail-panel-fort-sculpture',                    'sculpture-stonework',        'A carved stone panel believed to come from a fort structure.',                                        'Basalt',        'Period to be confirmed',  'Western Maharashtra (probable)', 'IN_COLLECTION', FALSE, 3),
    ('Kuthari-Style Dagger',                            'kuthari-style-dagger',                           'maratha-heritage',           'A dagger with a curved, partially sharpened blade, decorated with metalwork.',                        'Steel, Brass',  '19th Century',           'Deccan',                    'ON_REQUEST',    FALSE, 4),
    ('Hand-Woven Peshwa-Era Textile Fragment',          'hand-woven-peshwa-era-textile-fragment',          'textiles',                   'A hand-woven textile fragment, possibly silk, from the Peshwa era.',                                  'Silk',          '18th-19th Century',      'Western India',             'IN_COLLECTION', FALSE, 5),
    ('Documented Family Ledger (Marathi)',              'documented-family-ledger-marathi',                'documentation-manuscripts',  'A family ledger written in Marathi documenting household accounts.',                                  'Paper, Iron-gall ink', 'Date to be confirmed', '',                           'IN_COLLECTION', FALSE, 6)
) AS v (name, slug, category_slug, description, material, period, region, availability, featured, sort_order)
JOIN categories c ON c.slug = v.category_slug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO journal_articles (
    title, slug, category, content, cover_image, author, publish_date, status,
    seo_title, seo_description,
    created_at, updated_at
)
SELECT
    v.title, v.slug, v.category, v.content, NULL, v.author, v.publish_date, 'PUBLISHED',
    v.seo_title, v.seo_description,
    NOW(), NOW()
FROM (VALUES
    ('The House of Raajwarasa: An Introduction',
     'the-house-of-raajwarasa-an-introduction',
     'House Story',
     '<p>The Raajwarasa collection brings together objects connected to the Maratha era and the wider Deccan: metalwork, sculpture, textiles, and written material preserved across generations.</p><p>Each piece is documented as carefully as the research allows. Where a particular detail cannot yet be confirmed, we say so plainly and leave the record open for further study.</p>',
     'The Raajwarasa Research Desk',
     TIMESTAMPTZ '2026-01-10 09:00:00+05:30',
     'The House of Raajwarasa: An Introduction',
     'An introduction to the Raajwarasa collection: Maratha-era metalwork, stone, textiles and manuscript material.'),
    ('Notes on Preserving Fragile Textiles',
     'notes-on-preserving-fragile-textiles',
     'Conservation Notes',
     '<p>Hand-loomed textile fragments, often of silk, can survive for generations when handled sparingly.</p><p>We keep such pieces away from direct light, store them flat where possible, and avoid folding along the same crease twice. Detailed guidance is a guided visit away.</p>',
     'The Raajwarasa Research Desk',
     TIMESTAMPTZ '2026-01-25 09:00:00+05:30',
     'Notes on Preserving Fragile Textiles',
     'Practical notes on the care of fragile handloom and silk textile fragments.')
) AS v (title, slug, category, content, author, publish_date, seo_title, seo_description)
ON CONFLICT (slug) DO NOTHING;