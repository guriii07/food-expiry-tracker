# app.py
from flask import Flask, render_template, request, jsonify, g
import sqlite3
from datetime import datetime
import os

# --- Configuration ---
app = Flask(__name__)
# Define the SQLite database file name
DATABASE = 'food_tracker.db'
# Define the SQL schema file name
SQL_SCHEMA = 'schema.sql'


# --- Database Setup (DBMS Concept: Connection Management & Transactions) ---

def get_db():
    """Connects to the specific database and returns the connection object."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        # Allows accessing columns by name instead of index
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Closes the database connection at the end of the request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Initializes the database from the schema.sql file."""
    with app.app_context():
        db = get_db()
        with open(SQL_SCHEMA, 'r') as f:
            # Executes all SQL commands in the schema file
            db.executescript(f.read())
        db.commit()
    print("Database initialized successfully!")

# Initialize the database if the file doesn't exist
if not os.path.exists(DATABASE):
    init_db()


# --- FoodItem Class (Python OOP Concept) ---

class FoodItem:
    """Models a food item with expiry logic."""
    def __init__(self, name, quantity, expiry_date, item_id=None):
        self.item_id = item_id
        self.name = name
        self.quantity = quantity
        self.expiry = expiry_date

    def calculate_days_left(self):
        """Calculates days left until expiry (OOP Method)."""
        today = datetime.now().date()
        exp_date = datetime.strptime(self.expiry, '%Y-%m-%d').date()
        days_left = (exp_date - today).days
        return days_left

    def to_dict(self):
        """Returns the item data as a dictionary for JSON serialization."""
        days_left = self.calculate_days_left()
        
        # Determine status for front-end display
        if days_left <= 0:
            status = 'Expired'
        else:
            status = days_left
            
        return {
            'id': self.item_id,
            'name': self.name,
            'quantity': self.quantity,
            'expiry': self.expiry,
            'days_left': status,
        }


# --- Flask Routes ---

@app.route('/')
def index():
    """Serves the main HTML page (using your existing index.html)."""
    return render_template('index.html')


@app.route('/api/items', methods=['GET'])
def get_items():
    """
    API endpoint to retrieve all food items.
    (ADSA/DBMS Concept: Data is sorted efficiently by the database using ORDER BY)
    """
    db = get_db()
    
    # Query retrieves data, sorted by expiry date ascending (oldest first)
    query = "SELECT item_id, name, quantity, expiry_date FROM FoodItem ORDER BY expiry_date ASC;" 
    cursor = db.execute(query)
    rows = cursor.fetchall()
    
    food_list = []
    for row in rows:
        # Create a FoodItem object and use its OOP methods for logic
        item = FoodItem(
            item_id=row['item_id'], 
            name=row['name'], 
            quantity=row['quantity'], 
            expiry_date=row['expiry_date']
        )
        food_list.append(item.to_dict())
        
    return jsonify(food_list)


@app.route('/api/items', methods=['POST'])
def add_item():
    """API endpoint to add a new food item."""
    data = request.get_json()
    name = data.get('name')
    quantity = data.get('quantity')
    expiry = data.get('expiry') # YYYY-MM-DD format
    
    if not all([name, quantity, expiry]):
        return jsonify({'error': 'Missing required fields'}), 400

    db = get_db()
    try:
        # DBMS Concept: Insert operation
        db.execute(
            "INSERT INTO FoodItem (name, quantity, expiry_date) VALUES (?, ?, ?)",
            (name, quantity, expiry)
        )
        db.commit() # DBMS Concept: Commit transaction
        return jsonify({'message': 'Item added successfully'}), 201
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {e}'}), 500


@app.route('/api/items/clear', methods=['POST'])
def clear_items():
    """API endpoint to clear all food items."""
    db = get_db()
    try:
        # DBMS Concept: DELETE operation
        db.execute("DELETE FROM FoodItem")
        db.commit() # DBMS Concept: Commit transaction
        return jsonify({'message': 'All items cleared successfully'}), 200
    except sqlite3.Error as e:
        return jsonify({'error': f'Database error: {e}'}), 500


if __name__ == '__main__':
    # You can run the application using 'python app.py'
    app.run(debug=True)