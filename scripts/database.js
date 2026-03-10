const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const dbFile = "munchiData.db";
const dbPath = path.join(__dirname, dbFile);
let db;
let SQL;

function saveDb() {
  try {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (err) {
    console.error("Error saving database", err.message);
  }
}

function execGet(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function execAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function buildBuildingTable() {
  try {
    db.run(`CREATE TABLE IF NOT EXISTS building (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      x_coord REAL NOT NULL,
      y_coord REAL NOT NULL,
      time_opens TEXT NOT NULL,
      time_closes TEXT NOT NULL,
      num_snack_machines INTEGER,
      num_drink_machines INTEGER,
      num_ratings INTEGER,
      average_ratings REAL,
      needs_service BOOLEAN
    )`);
    console.log("Building table created successfully :D");
  } catch (err) {
    console.error("Error creating table >:(", err.message);
  }
}

function createIndexes() {
  try {
    db.run(`CREATE INDEX IF NOT EXISTS idx_building_name ON building(name)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_review_building_id ON review(building_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_report_building_id ON report(building_id)`);
    console.log("Database indexes created successfully :D");
  } catch (err) {
    console.error("Error creating indexes >:(", err.message);
  }
}

function buildReviewTable() {
  try {
    db.run(`CREATE TABLE IF NOT EXISTS review (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment TEXT,
      building_id INTEGER,
      product_rating INTEGER,
      FOREIGN KEY (building_id) REFERENCES building(id)
    )`);
    console.log("Review table created successfully :D");
  } catch (err) {
    console.error("Error creating review table >:(", err.message);
  }
}

function buildReportTable() {
  try {
    db.run(`CREATE TABLE IF NOT EXISTS report (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER,
      title TEXT,
      description TEXT,
      FOREIGN KEY (building_id) REFERENCES building(id)
    )`);
    console.log("Report table created successfully :D");
  } catch (err) {
    console.error("Error creating report table >:(", err.message);
  }
}

function updateReviewTable() {
  try {
    const rows = execAll(db, "PRAGMA table_info(review)");
    const isOldTable = rows.some((row) => row.name === "functionality_rating");

    if (isOldTable) {
      console.log("functionality_rating field found. Dropping and rebuilding the review table.");
      db.run("DROP TABLE review");
      buildReviewTable();
      console.log("New review table created successfully.");
    } else {
      console.log("Update to review table already executed.");
    }
  } catch (err) {
    console.error("Error updating review table.", err.message);
  }
}

async function initializeDatabase() {
  SQL = await initSqlJs();
  let filebuffer;
  try {
    filebuffer = fs.readFileSync(dbPath);
  } catch {
    filebuffer = null;
  }
  db = filebuffer ? new SQL.Database(filebuffer) : new SQL.Database();
  console.log("Connected to the SQLite database.");

  const hasBuilding = execGet(db, "SELECT name FROM sqlite_master WHERE type='table' AND name=?", ["building"]);
  if (!hasBuilding) {
    console.log("Building does not yet exist-- creating now :P");
    buildBuildingTable();
    await populateWithStarterData();
    saveDb();
  } else {
    console.log("Building table already exists :P");
  }

  const hasReview = execGet(db, "SELECT name FROM sqlite_master WHERE type='table' AND name=?", ["review"]);
  if (!hasReview) {
    console.log("Review table does not yet exist-- creating now :P");
    buildReviewTable();
  } else {
    console.log("Review table already exists :P");
    updateReviewTable();
  }

  const hasReport = execGet(db, "SELECT name FROM sqlite_master WHERE type='table' AND name='report'");
  if (!hasReport) {
    console.log("Report table does not yet exist-- creating now :P");
    buildReportTable();
  } else {
    console.log("Report table already exists :P");
  }

  createIndexes();
  saveDb();
}

const populateWithStarterData = async () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "../database/originalBuildings.JSON"), "utf8");
    const jsonData = JSON.parse(data);

    const sql =
      "INSERT INTO building (name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.run("BEGIN TRANSACTION");
    const stmt = db.prepare(sql);
    for (const item of jsonData) {
      stmt.bind([
        item.name,
        item.x_coord,
        item.y_coord,
        item.time_opens,
        item.time_closes,
        item.num_snack_machines,
        item.num_drink_machines,
        item.num_ratings,
        item.average_ratings,
        item.needs_service,
      ]);
      stmt.step();
      stmt.reset();
    }
    stmt.free();
    db.run("COMMIT");
  } catch (err) {
    db.run("ROLLBACK");
    console.error("Error in populateWithStarterData", err.message);
  }
};

function fetchSpecificBuildingByName(name) {
  return execGet(db, "SELECT * FROM building WHERE name = ?", [name]);
}

function fetchSpecificBuildingByKey(key) {
  return execGet(db, "SELECT * FROM building WHERE id = ?", [key]);
}

function getBuildingIDByName(name) {
  return execGet(db, "SELECT id FROM building WHERE name = ?", [name]);
}

function getX(name) {
  return execGet(db, "SELECT x_coord FROM building WHERE name = ?", [name]);
}

function getY(name) {
  return execGet(db, "SELECT y_coord FROM building WHERE name = ?", [name]);
}

function fetchAllBuildingNames() {
  return execAll(db, "SELECT name FROM building");
}

function getNumSnackMachines(name) {
  return execGet(db, "SELECT num_snack_machines FROM building WHERE name = ?", [name]);
}

function getNumDrinkMachines(name) {
  return execGet(db, "SELECT num_drink_machines FROM building WHERE name = ?", [name]);
}

module.exports = {
  initializeDatabase,
  populateWithStarterData,
  fetchSpecificBuildingByName,
  fetchSpecificBuildingByKey,
  getBuildingIDByName,
  fetchAllBuildingNames,
  getX,
  getY,
  getNumSnackMachines,
  getNumDrinkMachines,

  addReport: async (building_id, title, description) => {
    try {
      db.run("INSERT INTO report (building_id, title, description) VALUES (?, ?, ?)", [
        building_id,
        title,
        description,
      ]);
      saveDb();
    } catch (dbError) {
      console.error(dbError);
    }
  },

  insertBuilding: async (
    name,
    x_coord,
    y_coord,
    time_opens,
    time_closes,
    num_snack_machines,
    num_drink_machines,
    num_ratings,
    average_ratings,
    needs_service
  ) => {
    try {
      db.run(
        "INSERT INTO building (name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          x_coord,
          y_coord,
          time_opens,
          time_closes,
          num_snack_machines,
          num_drink_machines,
          num_ratings,
          average_ratings,
          needs_service,
        ]
      );
      saveDb();
    } catch (dbError) {
      console.error(dbError);
    }
  },

  insertReview: async (comment, building_id, product_rating) => {
    try {
      db.run("BEGIN TRANSACTION");
      db.run("INSERT INTO review (comment, building_id, product_rating) VALUES (?, ?, ?)", [
        comment,
        building_id,
        product_rating,
      ]);
      db.run(
        `UPDATE building
         SET num_ratings = (SELECT COUNT(*) FROM review WHERE review.building_id = building.id),
             average_ratings = (SELECT COALESCE(AVG(product_rating), 0) FROM review WHERE review.building_id = building.id)
         WHERE id = ?`,
        [building_id]
      );
      db.run("COMMIT");
      saveDb();
    } catch (dbError) {
      db.run("ROLLBACK");
      console.error(dbError);
    }
  },

  fetchAllBuildings: async () => {
    try {
      return execAll(db, "SELECT * FROM building");
    } catch (dbError) {
      console.error(dbError);
      return [];
    }
  },

  fetchAllReviews: async () => {
    try {
      return execAll(db, "SELECT * FROM review");
    } catch (dbError) {
      console.error(dbError);
      return [];
    }
  },
};
