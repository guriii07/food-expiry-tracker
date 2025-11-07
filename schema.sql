-- schema.sql
-- Relational Schema Design (DBMS Concept)

-- Table for Food Categories to demonstrate Foreign Key relationships (Normalization)
CREATE TABLE FoodCategory (
    category_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Main table for Food Items
CREATE TABLE FoodItem (
    item_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    expiry_date TEXT NOT NULL, -- Stored as YYYY-MM-DD
    category_id INTEGER,
    
    -- Constraint: Ensure expiry date looks like a date (YYYY-MM-DD)
    CHECK(expiry_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    
    -- Foreign Key: Links items to categories
    FOREIGN KEY (category_id) 
        REFERENCES FoodCategory (category_id) 
        ON DELETE SET NULL 
);

-- Initial Categories (Example data)
INSERT INTO FoodCategory (name) VALUES ('Dairy');
INSERT INTO FoodCategory (name) VALUES ('Produce');
INSERT INTO FoodCategory (name) VALUES ('Meat');
INSERT INTO FoodCategory (name) VALUES ('Pantry');