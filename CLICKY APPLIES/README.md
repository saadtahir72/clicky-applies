const SHEET_NAME = "Form_Responses";

/**
 * Health check
  */
  function doGet() {
    return ContentService
        .createTextOutput(JSON.stringify({
              status: "ok",
                    message: "Clicky Web App is live"
                        }))
                            .setMimeType(ContentService.MimeType.JSON);
                            }

                            /**
                             * MAIN FUNCTION (this saves data)
                              */
                              function doPost(e) {
                                try {
                                    const data = JSON.parse(e.postData.contents);

                                        const ss = SpreadsheetApp.getActiveSpreadsheet();
                                            const sheet = ss.getSheetByName(SHEET_NAME);

                                                if (!sheet) {
                                                      throw new Error("Sheet not found: " + SHEET_NAME);
                                                          }

                                                              sheet.appendRow([
                                                                    new Date(),
                                                                          data.bdName || "",
                                                                                data.company || "",
                                                                                      data.jobTitle || "",
                                                                                            data.jobUrl || "",
                                                                                                  data.techStack || ""
                                                                                                      ]);

                                                                                                          return ContentService
                     
