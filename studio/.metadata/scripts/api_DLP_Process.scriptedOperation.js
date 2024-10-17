/*
https://cloud.google.com/sensitive-data-protection/docs/high-sensitivity-infotypes-reference

WARNING: Looking for all and every sensitive data is not a good practice
         https://cloud.google.com/sensitive-data-protection/docs/concepts-infotypes
  <<Avoid enabling infoType detectors that you don't need. Although the following are
    useful in certain scenarios, these infoTypes can make requests run much more slowly
    than requests that don't include them:>>
*/
function run(input, params) {
  
  Console.log("TestDLP...");
  
  Console.log("Env. google.dlp.infotypes => " + Env["google.dlp.infotypes"]);

  var infoTypesHighSensibility = "US_SOCIAL_SECURITY_NUMBER,US_PASSPORT,PASSPORT,US_DRIVERS_LICENSE_NUMBER,CREDIT_CARD_NUMBER,IBAN_CODE,SWIFT_CODE,US_EMPLOYER_IDENTIFICATION_NUMBER,US_INDIVIDUAL_TAXPAYER_IDENTIFICATION_NUMBER";
  
  var lessImportantTypes = "GENERIC_ID,STREET_ADDRESS,DATE_OF_BIRTH,PERSON_NAME,GENDER,LAST_NAME,FIRST_NAME,EMAIL_ADDRESS";
  
  var srcBlob = input["file:content"];
  
  var mimetype = srcBlob.mimeType;
  
  var blobs = [];
  
  if (mimetype === "application/pdf") {
    
    Context.SetMetadataFromBlob(srcBlob, {});
    Console.log(ctx.binaryMetadata);
    
    var pageCount = ctx.binaryMetadata.PageCount;
    
    Console.log(pageCount);

    for(var i=1; i<= pageCount;i++) {
      blobs.push(PDF.ExtractPages(input, {
        startPage : ""+i,
        endPage: ""+i
      }));
    }
    
    Console.log(blobs);
    
    blobs = toJsArray(blobs).map(function(blob) {
      Console.log(blob);
      return Blob.RunConverter(blob, {
        'converter': 'simpleJpegCompressor'
      });
    });
    Console.log(blobs);
  } else {
    blobs.push(srcBlob);
  }
  
  var findings = [];
  
  blobs.forEach(function(blob, index) {

    try {
      //get findings
      var resultBlob = Blob.IdentifySensitiveData(blob, {
        'infotypes': infoTypesHighSensibility + "," + lessImportantTypes, // let's try all of them
        'maxfindings': 20,
        'convertToText':'false'
      });

      //collect findings
      Console.log(resultBlob.getString());

      var pageFindings = JSON.parse(resultBlob.getString());

      pageFindings.findings.forEach(function(finding) {
        var location = JSON.parse(finding.locationJsonStr);
        delete finding.locationJsonStr;
        location.pageNumber = index;
        finding.locationJson = JSON.stringify(location);
        findings.push(finding);
      });
    } catch (error) {
      Console.log("error on page "+index);
      Console.log(error);
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
    /*required:true - type: string*/
    'complexJsonProperties': JSON.stringify(findings),
    /*required:true - type: string*/
    'xpath': "dlp:findings",
    /*required:false - type: boolean*/
    'save': true
  });

  Console.log("Add annotations...");

  //creation redaction annotations
  input = NEV.CreateDlpAnnotations(input, {});
  
  Console.log("\n==============================\nTestDLP.......DONE\n==============================");
  
}


function toJsArray(javaArray) {
  var jsArray = [];
  for(var i=0; javaArray && (i < javaArray.length ); i++) {
    jsArray.push(javaArray[i]);
  }
  return jsArray;
}

