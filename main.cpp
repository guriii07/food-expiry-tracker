#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <sstream>
#include <ctime>
using namespace std;

struct FoodItem {
    string name;
    string quantity;
    string expiry;
};

// Function to convert string date (yyyy-mm-dd) to time_t
time_t toTimeT(string date) {
    struct tm tm = {};
    sscanf(date.c_str(), "%d-%d-%d", &tm.tm_year, &tm.tm_mon, &tm.tm_mday);
    tm.tm_year -= 1900;
    tm.tm_mon -= 1;
    return mktime(&tm);
}

// Sort by expiry date
bool sortByExpiry(FoodItem a, FoodItem b) {
    return toTimeT(a.expiry) < toTimeT(b.expiry);
}

int main() {
    vector<FoodItem> items;
    int n;
    cout << "Enter number of food items: ";
    cin >> n;

    for (int i = 0; i < n; i++) {
        FoodItem f;
        cout << "\nEnter food name: ";
        cin >> f.name;
        cout << "Enter quantity (e.g., 2kg, 1L, 500g): ";
        cin >> f.quantity;
        cout << "Enter expiry date (yyyy-mm-dd): ";
        cin >> f.expiry;
        items.push_back(f);
    }

    sort(items.begin(), items.end(), sortByExpiry);

    ofstream fout("data.txt");
    fout << "Name,Quantity,Expiry\n";
    for (auto &f : items) {
        fout << f.name << "," << f.quantity << "," << f.expiry << "\n";
    }
    fout.close();

    cout << "\nData saved to data.txt successfully!\n";
    cout << "Open index.html to view your Food Expiry Tracker UI.\n";
    return 0;
}
