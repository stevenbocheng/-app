/**
 * Google Apps Script for Korea Travel App
 * Deploy this as a Web App to handle GET and POST requests.
 */

const SHEET_ID = '1rbZie9_SvPII6giNBqnvzvkq5my3fDXEE4fy_p-U0Y0';

function doGet(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const uid = e.parameter.uid;
  if (!uid) return ContentService.createTextOutput(JSON.stringify({ error: 'Missing UID' })).setMimeType(ContentService.MimeType.JSON);

  const data = {
    meta: getMeta(ss, uid),
    itinerary: getRowsForUser(ss, 'Itinerary', uid),
    logistics: {
      flights: getFlights(ss, uid),
      hotel: getHotel(ss, uid)
    },
    checklists: getRowsForUser(ss, 'Checklist', uid),
    expenses: getRowsForUser(ss, 'Expenses', uid)
  };
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const payload = params.payload;
  const uid = params.uid; // Global UID for isolation
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  let result = { success: true };
  
  try {
    switch (action) {
      case 'login':
        result = verifyUser(ss, payload.username, payload.password);
        break;
      case 'update_meta':
        setMeta(ss, uid, payload);
        break;
      case 'update_itinerary':
        setItinerary(ss, uid, payload.day, payload.items);
        break;
      case 'update_checklist':
        setChecklist(ss, uid, payload.category, payload.items);
        break;
      case 'update_expenses':
        setExpensesData(ss, uid, payload.items);
        break;
      case 'update_logistics':
        setLogistics(ss, uid, payload.type, payload.data);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Helper Functions ---

function getRowsForUser(ss, sheetName, uid) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  const uidIdx = headers.indexOf('userId');
  if (uidIdx === -1) return [];

  return rows.filter(row => row[uidIdx] == uid).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function appendRow(ss, sheetName, payload) {
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => payload[header] || '');
  sheet.appendRow(newRow);
}

function updateRow(ss, sheetName, id, payload) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      const rowNum = i + 1;
      headers.forEach((header, j) => {
        if (payload[header] !== undefined) {
          sheet.getRange(rowNum, j + 1).setValue(payload[header]);
        }
      });
      break;
    }
  }
}

function getMeta(ss, uid) {
  const sheet = ss.getSheetByName('Meta');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIdx = headers.indexOf('userId');
  const tz = Session.getScriptTimeZone();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][uidIdx] == uid) {
      return { 
        title: data[i][headers.indexOf('title')], 
        startDate: data[i][headers.indexOf('startDate')] instanceof Date ? Utilities.formatDate(data[i][headers.indexOf('startDate')], tz, "yyyy-MM-dd") : data[i][headers.indexOf('startDate')],
        endDate: data[i][headers.indexOf('endDate')] instanceof Date ? Utilities.formatDate(data[i][headers.indexOf('endDate')], tz, "yyyy-MM-dd") : data[i][headers.indexOf('endDate')]
      };
    }
  }
  return { title: '我的韓國旅程', startDate: '', endDate: '' };
}

function setMeta(ss, uid, payload) {
  const sheet = ss.getSheetByName('Meta');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIdx = headers.indexOf('userId');
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][uidIdx] == uid) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow === -1) {
    const newRow = headers.map(h => h === 'userId' ? uid : (payload[h] || ''));
    sheet.appendRow(newRow);
  } else {
    if (payload.title) sheet.getRange(foundRow, headers.indexOf('title') + 1).setValue(payload.title);
    if (payload.startDate) sheet.getRange(foundRow, headers.indexOf('startDate') + 1).setValue(payload.startDate);
    if (payload.endDate) sheet.getRange(foundRow, headers.indexOf('endDate') + 1).setValue(payload.endDate);
  }
}

function getFlights(ss, uid) {
  return getLogisticsDataForUser(ss, 'flights', uid);
}

function getHotel(ss, uid) {
  return getLogisticsDataForUser(ss, 'hotel', uid);
}

function getLogisticsDataForUser(ss, type, uid) {
  const sheet = ss.getSheetByName('Logistics');
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === type && data[i][2] == uid) return JSON.parse(data[i][1]);
  }
  return {};
}

function setLogistics(ss, uid, type, data) {
  const sheet = ss.getSheetByName('Logistics');
  const vals = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] === type && vals[i][2] == uid) {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(data));
      found = true;
      break;
    }
  }
  if (!found) sheet.appendRow([type, JSON.stringify(data), uid]);
}

function setItinerary(ss, uid, day, items) {
  const sheet = ss.getSheetByName('Itinerary');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIdx = headers.indexOf('userId');
  const dayIdx = headers.indexOf('day');

  // Create a list of rows to delete (reverse order to keep indices valid)
  // Or better: read all, filter out the ones to delete, then clear sheet and write back? 
  // No, that's too risky for concurrency. Stick to deleteRow.
  // Actually, deleteRow is slow in loops. 
  // Optimized approach: Filter data in memory and overwrite is dangerous if volume is high.
  // Standard approach:
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][uidIdx] == uid && data[i][dayIdx] == day) sheet.deleteRow(i + 1);
  }

  items.forEach(item => {
    // Dynamic mapping based on headers
    const row = headers.map(header => {
      if (header === 'userId') return uid;
      if (header === 'day') return day;
      return item[header] || '';
    });
    sheet.appendRow(row);
  });
}

function setChecklist(ss, uid, category, items) {
  const sheet = ss.getSheetByName('Checklist');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIdx = headers.indexOf('userId');
  const catIdx = headers.indexOf('category');

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][uidIdx] == uid && data[i][catIdx] == category) sheet.deleteRow(i + 1);
  }
  items.forEach(item => {
    const row = headers.map(header => {
      if (header === 'userId') return uid;
      if (header === 'category') return category;
      return item[header] !== undefined ? item[header] : '';
    });
    sheet.appendRow(row);
  });
}

function setExpensesData(ss, uid, items) {
  const sheet = ss.getSheetByName('Expenses');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIdx = headers.indexOf('userId');
  
  if (uidIdx !== -1) {
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][uidIdx] == uid) sheet.deleteRow(i + 1);
    }
  }
  
  items.forEach(item => {
    const row = headers.map(header => {
      if (header === 'userId') return uid;
      return item[header] !== undefined ? item[header] : '';
    });
    sheet.appendRow(row);
  });
}

function verifyUser(ss, username, password) {
  const sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, error: 'Users sheet not found' };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdx = headers.indexOf('username');
  const passIdx = headers.indexOf('password');
  const tripIdx = headers.indexOf('tripId');
  
  for (let i = 1; i < data.length; i++) {
    const sUser = String(data[i][userIdx]);
    const sPass = String(data[i][passIdx]);
    const sTrip = String(data[i][tripIdx] || '');
    if (sUser === String(username) && sPass === String(password)) {
      return { 
        success: true, 
        user: { 
          uid: sUser, 
          username: sUser,
          tripId: sTrip
        } 
      };
    }
  }
  return { success: false, error: '帳號或密碼錯誤' };
}
