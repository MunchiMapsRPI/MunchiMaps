///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                                                                                                                    //////
/////   This file will use axios to make HTTP requests and put coord data into a CSV file and type data into a JSON file   //////
/////                                                                                                                    //////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = "http://localhost:5000/api/v1";

let buildingNames = [];
let coordsMap = new Map();
let typeMap = new Map();

const fetchAllBuildingNames = async () => {
  try {
    buildingNames = [];
    const pageSize = 200;
    let offset = 0;
    let total = Infinity;

    while (offset < total) {
      const response = await axios.get(`${API_BASE}/building/names`, {
        params: { limit: pageSize, offset },
      });
      const { data, meta } = response.data || {};
      const items = data && data.items;
      const t = meta && meta.total;
      total = typeof t === "number" ? t : 0;

      if (!Array.isArray(items)) {
        console.error("Expected items array in paginated response:", response.data);
        buildingNames = [];
        return;
      }

      items.forEach((row) => {
        if (row && row.name) buildingNames.push(row.name);
      });

      offset += items.length;
      if (items.length === 0) break;
    }

    console.log("Building Names:", buildingNames);
  } catch (error) {
    console.error("Error fetching building names:", error);
    buildingNames = [];
  }
};

/** Full building row by name (one round trip: coords + machine counts + id). */
const fetchBuildingByName = async (name) => {
  try {
    const encoded = encodeURIComponent(name);
    const response = await axios.get(`${API_BASE}/building/name/${encoded}`);
    return response.data && response.data.data;
  } catch (error) {
    console.error(`Error fetching building "${name}":`, error);
    return null;
  }
};

// Function to build a map with key building name and values x and y coords
// One GET /building/name/:name per building fills both coord and type maps
const buildCoordAndTypeMaps = async () => {
  if (buildingNames.length === 0) {
    console.log("Building names list is empty.");
    return;
  }
  for (const name of buildingNames) {
    console.log("Current Building:", name);
    const building = await fetchBuildingByName(name);
    if (!building) continue;

    if (building.x_coord != null && building.y_coord != null) {
      coordsMap.set(name, [building.x_coord, building.y_coord]);
    }
    const has_drink_machine = Number(building.num_drink_machines) > 0;
    const has_snack_machine = Number(building.num_snack_machines) > 0;
    typeMap.set(name, [has_drink_machine, has_snack_machine]);
  }
  console.log("Coords map:", coordsMap);
  console.log("Type Map:", typeMap);
};

// Exports names and coordinates to a CSV file for testPlot to read from
const exportCoordData = (filePath) => {
  const header = "Name, x_coord, y_coord\n";
  const rows = Array.from(coordsMap.entries()).map(([name, [x, y]]) => `"${name}","${x}","${y}"`).join('\n');
  const content = header + rows;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("CSV file created at", filePath);
};

// Function to create a JSON file for typeMap data
const exportTypeData = (filename) => {
  const jsonData = Array.from(typeMap.entries()).reduce((acc, [name, [has_drinks, has_snacks]]) => {
    acc.push({ name, drink: has_drinks, food: has_snacks });
    return acc;
  }, []);
  
  fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log("JSON file created at", filename);
};

// Main function to execute all commands required
const runDataProcessing = async () => {
  console.log("Running function runDataProcessing :P");
  const coordFile = path.join(__dirname, '../database/building_coords.csv');
  const typeFile = path.join(__dirname, '../database/type_data.JSON');
  
  const fileExists = (file) => fs.existsSync(file);
  
  if(!fileExists(coordFile) || !fileExists(typeFile)){
    try {
      await fetchAllBuildingNames();
      await buildCoordAndTypeMaps();
    }
    catch (err) {
      console.error("Error reading in data.");
    }
  }
  if(!fileExists(coordFile)){
    try {
      exportCoordData(coordFile);
    }
    catch (err) {
      console.error("Error exporting coordinate data.");
    }
  }
  else {
    console.log("Coords File already exists.");
  }

  if(!fileExists(typeFile)){
    try {
      exportTypeData(typeFile);
    }
    catch (err) {
      console.error("Error exporting type data.");
    }
  }
  else{
    console.log("Type file already exists.");
  }
}

module.exports = { runDataProcessing };