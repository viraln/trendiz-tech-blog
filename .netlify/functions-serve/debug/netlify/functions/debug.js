// netlify/functions/debug.js
var path = require("path");
var fs = require("fs");
exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  try {
    const debugInfo = {
      environment: process.env.NODE_ENV,
      currentDirectory: process.cwd(),
      files: {}
    };
    const pathsToCheck = [
      "./content/articles",
      "../content/articles",
      "../../content/articles",
      "/opt/build/repo/content/articles",
      "/var/task/content/articles",
      "/opt/build/content/articles",
      path.join(process.cwd(), "content/articles"),
      path.join(process.cwd(), "../content/articles"),
      path.join(process.cwd(), "../../content/articles")
    ];
    debugInfo.pathChecks = {};
    for (const dirPath of pathsToCheck) {
      debugInfo.pathChecks[dirPath] = {
        exists: false,
        isDirectory: false,
        readable: false,
        files: [],
        error: null
      };
      try {
        const exists = fs.existsSync(dirPath);
        debugInfo.pathChecks[dirPath].exists = exists;
        if (exists) {
          const stats = fs.statSync(dirPath);
          debugInfo.pathChecks[dirPath].isDirectory = stats.isDirectory();
          if (stats.isDirectory()) {
            try {
              fs.accessSync(dirPath, fs.constants.R_OK);
              debugInfo.pathChecks[dirPath].readable = true;
              const files = fs.readdirSync(dirPath);
              debugInfo.pathChecks[dirPath].fileCount = files.length;
              debugInfo.pathChecks[dirPath].files = files.slice(0, 10);
            } catch (readError) {
              debugInfo.pathChecks[dirPath].error = `Cannot read directory: ${readError.message}`;
            }
          }
        }
      } catch (checkError) {
        debugInfo.pathChecks[dirPath].error = checkError.message;
      }
    }
    debugInfo.os = {
      platform: process.platform,
      release: process.release,
      versions: process.versions
    };
    debugInfo.memory = process.memoryUsage();
    const safeEnv = { ...process.env };
    for (const key in safeEnv) {
      if (key.includes("TOKEN") || key.includes("SECRET") || key.includes("KEY") || key.includes("PASS")) {
        safeEnv[key] = "[REDACTED]";
      }
    }
    debugInfo.env = safeEnv;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(debugInfo, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error generating debug info",
        message: error.message,
        stack: error.stack
      })
    };
  }
};
//# sourceMappingURL=debug.js.map
