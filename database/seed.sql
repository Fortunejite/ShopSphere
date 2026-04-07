-- Top-level categories
INSERT INTO categories (name, slug, created_at, updated_at)
VALUES
  ('Technology', 'technology', NOW(), NOW()),
  ('Fashion', 'fashion', NOW(), NOW()),
  ('Health', 'health', NOW(), NOW()),
  ('Business', 'business', NOW(), NOW()),
  ('Lifestyle', 'lifestyle', NOW(), NOW()),
  ('Education', 'education', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Child categories
INSERT INTO categories (name, slug, parent_id, created_at, updated_at)
VALUES
  ('Software', 'software', (SELECT id FROM categories WHERE slug = 'technology'), NOW(), NOW()),
  ('Hardware', 'hardware', (SELECT id FROM categories WHERE slug = 'technology'), NOW(), NOW()),
  ('AI & ML', 'ai-ml', (SELECT id FROM categories WHERE slug = 'technology'), NOW(), NOW()),

  ('Men', 'fashion-men', (SELECT id FROM categories WHERE slug = 'fashion'), NOW(), NOW()),
  ('Women', 'fashion-women', (SELECT id FROM categories WHERE slug = 'fashion'), NOW(), NOW()),
  ('Accessories', 'fashion-accessories', (SELECT id FROM categories WHERE slug = 'fashion'), NOW(), NOW()),

  ('Nutrition', 'nutrition', (SELECT id FROM categories WHERE slug = 'health'), NOW(), NOW()),
  ('Fitness', 'fitness', (SELECT id FROM categories WHERE slug = 'health'), NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
