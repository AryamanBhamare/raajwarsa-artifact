-- Migrations run before Spring's DataSeeder, so V2's artifact seed could not
-- see the categories it joined against on a truly fresh database, leaving the
-- catalog empty. This migration inserts categories first and then the demo
-- artifacts, all idempotently. On databases where V2 already populated the
-- catalog a no-op results.

INSERT INTO categories (name, slug, description, created_at)
SELECT v.name, v.slug, v.description, NOW()
FROM (VALUES
    ('Maratha Heritage',                'maratha-heritage',                'Objects connected with the Maratha era and its material culture.'),
    ('Metalwork',                       'metalwork',                       'Bronze, brass and mixed-metal objects and utensils.'),
    ('Sculpture & Stonework',           'sculpture-stonework',             'Sculptural and carved stone objects.'),
    ('Textiles',                        'textiles',                        'Traditional textile heritage across Maharashtra.'),
    ('Documentation & Manuscripts',     'documentation-manuscripts',       'Written and printed heritage material.')
) AS v (name, slug, description)
ON CONFLICT (slug) DO NOTHING;

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