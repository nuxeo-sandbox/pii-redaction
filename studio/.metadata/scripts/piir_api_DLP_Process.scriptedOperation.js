function run(input, params) {

  logHelper("================================================================================");
  logHelper("== Begin...");
  logHelper("================================================================================");

  // For demos we check a lot of infotypes, but the docs recommend only
  // checking the info types that you know you need, for performance reasons.
  // https://cloud.google.com/sensitive-data-protection/docs/concepts-infotypes#higher-latency-detectors

  // https://cloud.google.com/sensitive-data-protection/docs/high-sensitivity-infotypes-reference
  var infoTypesHighSensibility = "US_SOCIAL_SECURITY_NUMBER,US_PASSPORT,PASSPORT,US_DRIVERS_LICENSE_NUMBER,CREDIT_CARD_NUMBER,IBAN_CODE,SWIFT_CODE,US_EMPLOYER_IDENTIFICATION_NUMBER,US_INDIVIDUAL_TAXPAYER_IDENTIFICATION_NUMBER";

  var lessImportantTypes = "GENERIC_ID,STREET_ADDRESS,DATE_OF_BIRTH,PERSON_NAME,GENDER,LAST_NAME,FIRST_NAME,EMAIL_ADDRESS";

  var srcBlob = input["file:content"];

  var mimetype = srcBlob.mimeType;

  var blobs = [];

  if (mimetype === "application/pdf") {

    Context.SetMetadataFromBlob(srcBlob, {});
    logHelper(ctx.binaryMetadata);

    var pageCount = ctx.binaryMetadata.PageCount;

    logHelper(pageCount);

    for (var i = 1; i <= pageCount; i++) {
      blobs.push(PDF.ExtractPages(input, {
        startPage: "" + i,
        endPage: "" + i
      }));
    }

    logHelper(blobs);

    blobs = toJsArray(blobs).map(function (blob) {
      logHelper(blob);
      return Blob.RunConverter(blob, {
        'converter': 'simpleJpegCompressor'
      });
    });
    logHelper(blobs);
  } else {
    blobs.push(srcBlob);
  }

  var findings = [];

  blobs.forEach(function (blob, index) {

    try {
      //get findings
      var resultBlob = Blob.IdentifySensitiveData(blob, {
        'infotypes': infoTypesHighSensibility + "," + lessImportantTypes, // let's try all of them
        'maxfindings': 20,
        'convertToText': 'false'
      });

      //collect findings
      logHelper(resultBlob.getString());

      var pageFindings = JSON.parse(resultBlob.getString());

      pageFindings.findings.forEach(function (finding) {
        var location = JSON.parse(finding.locationJsonStr);
        delete finding.locationJsonStr;
        location.pageNumber = index;
        finding.locationJson = JSON.stringify(location);
        findings.push(finding);
      });
    } catch (error) {
      logHelper("error on page " + index);
      logHelper(error);
    }
  });

  //add facet
  input = Document.AddFacet(input, {
    'facet': "DataLossPrevention",
    'save': false
  });

  input["dlp:sensitiveData"] = true;
  input["dlp:scanStatus"] = "done";

  //save findings
  input = Document.AddItemToListProperty(input, {
    'complexJsonProperties': JSON.stringify(findings),
    'xpath': "dlp:findings",
    'save': true
  });

  logHelper("Add annotations...");

  //creation redaction annotations
  input = NEV.CreateDlpAnnotations(input, {});

  logHelper("================================================================================");
  logHelper("== Done.");
  logHelper("================================================================================");
}

function toJsArray(javaArray) {
  var jsArray = [];
  for (var i = 0; javaArray && (i < javaArray.length); i++) {
    jsArray.push(javaArray[i]);
  }
  return jsArray;
}

//==============================================================================
// Prefix for log messages to make it easier to understand the context.
var LOG_PREFIX = "piir_api_DLP_Process: ";
// Turn log messages on or off globally.
var LOGGING_ENABLED = false;

function logHelper(message) {
  if (LOGGING_ENABLED)
    Console.warn(LOG_PREFIX + message);
}

