const SHEET_ID = "1kRMiz1ycWFwp2Q1U4I6Ymlr5YsXF7cKGmZ9ltV6Atpc"; // Replace with your actual Sheet ID
const SHEET_NAME = "Form_Responses";

function doGet() {
  return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", message: "Clicky Web App is live" })
        ).setMimeType(ContentService.MimeType.JSON);
        }

        function doPost(e) {
          try {
              if (!e || !e.postData || !e.postData.contents) {
                    throw new Error("No data received from extension");
                        }

                            const data = JSON.parse(e.postData.contents);

                                const ss = SpreadsheetApp.openById(SHEET_ID);
                                    let sheet = ss.getSheetByName(SHEET_NAME);

                                        // Create sheet + headers if missing
                                            if (!sheet) {
                                                  sheet = ss.insertSheet(SHEET_NAME);
                                                        sheet.appendRow(["Timestamp", "BD Name", "Company", "Job Title", "Job URL", "Tech Stack"]);
                                                              const headerRange = sheet.getRange(1, 1, 1, 6);
                                                                    headerRange.setBackground("#4a148c");
                                                                          headerRange.setFontColor("#ffffff");
                                                                                headerRange.setFontWeight("bold");
                                                                                      sheet.setFrozenRows(1);
                                                                                          }

                                                                                              // Append row safely
                                                                                                  sheet.appendRow([
                                                                                                        new Date(), // Always use server timestamp
                                                                                                              data.bdName || "",
                                                                                                                    data.company || "",
                                                                                                                          data.jobTitle || "",
                                                                                                                                data.jobUrl || "",
                                                                                                                                      data.techStack || ""
                                                                                                                                          ]);

                                                                                                                                              return ContentService.createTextOutput(
                                                                                                                                                    JSON.stringify({ status: "success", message: "Saved" })
                                                                                                                                                        ).setMimeType(ContentService.MimeType.JSON);

                                                                                                                                                          } catch (err) {
                                                                                                                                                              return ContentService.createTextOutput(
                                                                                                                                                                    JSON.stringify({ status: "error", message: err.toString() })
                                                                                                                                                                        ).setMimeType(ContentService.MimeType.JSON);
                                                                                                                                                                          }
                                                                                                                                                                          }
