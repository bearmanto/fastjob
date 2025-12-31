-- Audit Duplicate Companies
-- Checks if any owner has multiple companies (which breaks .single() calls)
-- Checks if any company name is duplicated

SELECT 
    owner_id, 
    COUNT(*) as company_count,
    array_agg(name) as names,
    array_agg(id) as ids
FROM 
    companies
GROUP BY 
    owner_id
HAVING 
    COUNT(*) > 1;

-- Also check duplicates by name just in case
SELECT 
    name, 
    COUNT(*) as name_count,
    array_agg(owner_id) as owners
FROM 
    companies
GROUP BY 
    name
HAVING 
    COUNT(*) > 1;
