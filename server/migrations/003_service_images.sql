-- Add image column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS image TEXT;

-- Set image paths for all 18 services
UPDATE services SET image = '/images/services/love-relationship.jpg'    WHERE slug = 'love-relationship-problems';
UPDATE services SET image = '/images/services/marriage-delay.jpg'       WHERE slug = 'marriage-delay';
UPDATE services SET image = '/images/services/career-confusion.jpg'     WHERE slug = 'career-job-confusion';
UPDATE services SET image = '/images/services/financial-instability.jpg' WHERE slug = 'financial-instability';
UPDATE services SET image = '/images/services/family-conflicts.jpg'     WHERE slug = 'family-conflicts';
UPDATE services SET image = '/images/services/mental-stress.jpg'        WHERE slug = 'mental-stress-anxiety';
UPDATE services SET image = '/images/services/health-wellness.jpg'      WHERE slug = 'health-wellness';
UPDATE services SET image = '/images/services/education-exam.jpg'       WHERE slug = 'education-exam-success';
UPDATE services SET image = '/images/services/business-growth.jpg'      WHERE slug = 'business-growth';
UPDATE services SET image = '/images/services/property-legal.jpg'       WHERE slug = 'property-legal-disputes';
UPDATE services SET image = '/images/services/jataka-matching.jpg'      WHERE slug = 'jataka-matching';
UPDATE services SET image = '/images/services/marriage-date.jpg'        WHERE slug = 'marriage-date-selection';
UPDATE services SET image = '/images/services/janna-jataka.jpg'         WHERE slug = 'janna-jataka';
UPDATE services SET image = '/images/services/family-children.jpg'      WHERE slug = 'child-birth-issues';
UPDATE services SET image = '/images/services/gemstone.jpg'             WHERE slug = 'gemstone-recommendation';
UPDATE services SET image = '/images/services/rahu-kuja-dosha.jpg'      WHERE slug = 'rahu-kuja-dosha';
UPDATE services SET image = '/images/services/black-magic-removal.jpg'  WHERE slug = 'black-magic-removal';
UPDATE services SET image = '/images/services/pitra-dosha.jpg'          WHERE slug = 'pitra-dosha';
