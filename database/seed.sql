-- Top-level categories
INSERT INTO categories (name, slug)
VALUES
  ('Technology', 'technology'),
  ('Fashion', 'fashion'),
  ('Health', 'health'),
  ('Business', 'business'),
  ('Lifestyle', 'lifestyle'),
  ('Education', 'education')
ON CONFLICT (slug) DO NOTHING;

-- Child categories
INSERT INTO categories (name, slug, parent_id)
VALUES
  ('Software', 'software', (SELECT id FROM categories WHERE slug = 'technology')),
  ('Hardware', 'hardware', (SELECT id FROM categories WHERE slug = 'technology')),
  ('AI & ML', 'ai-ml', (SELECT id FROM categories WHERE slug = 'technology')),

  ('Men', 'fashion-men', (SELECT id FROM categories WHERE slug = 'fashion')),
  ('Women', 'fashion-women', (SELECT id FROM categories WHERE slug = 'fashion')),
  ('Accessories', 'fashion-accessories', (SELECT id FROM categories WHERE slug = 'fashion')),

  ('Nutrition', 'nutrition', (SELECT id FROM categories WHERE slug = 'health')),
  ('Fitness', 'fitness', (SELECT id FROM categories WHERE slug = 'health'))
ON CONFLICT (slug) DO NOTHING;
