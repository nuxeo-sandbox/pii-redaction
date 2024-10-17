function run(input, params) {
  
  Console.log("DLP_CleanupData...");
    
  if(input.hasSchema("datalossprevention")) {
    input = Document.ResetSchema(
      input, {
        'schema': "datalossprevention",
        'save': true,
        'saveDocument': true
      });
  }
  
  if(input.hasFacet("DataLossPrevention")) {
    input = Document.RemoveFacet(
      input, {
        'facet': "DataLossPrevention",
        'save': true
      });
  }
  
  Console.log("DLP_CleanupData.......DONE");
  
  return input;

}