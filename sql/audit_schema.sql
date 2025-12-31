-- Introspect schema to verify keys and columns
SELECT 
    t.table_name, 
    c.column_name, 
    c.data_type,
    tc.constraint_type
FROM 
    information_schema.columns c
LEFT JOIN 
    information_schema.tables t ON c.table_name = t.table_name
LEFT JOIN 
    information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
LEFT JOIN 
    information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
WHERE 
    t.table_schema = 'public' 
    AND t.table_name IN ('subscriptions', 'companies', 'credit_balances')
ORDER BY 
    t.table_name, c.ordinal_position;
