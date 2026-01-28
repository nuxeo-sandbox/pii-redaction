function run(input, params) {

  logHelper("Begin...");

  if (input.hasSchema("datalossprevention")) {
    input = Document.ResetSchema(
      input, {
      'schema': "datalossprevention",
      'save': true,
      'saveDocument': true
    });
  }

  if (input.hasFacet("DataLossPrevention")) {
    input = Document.RemoveFacet(
      input, {
      'facet': "DataLossPrevention",
      'save': true
    });
  }

  logHelper("Done.");

  return input;

}

//==============================================================================
// Prefix for log messages to make it easier to understand the context.
var LOG_PREFIX = "piir_api_DLP_CleanupData: ";
// Turn log messages on or off globally.
var LOGGING_ENABLED = true;

function logHelper(message) {
  if (LOGGING_ENABLED)
    Console.warn(LOG_PREFIX + message);
}