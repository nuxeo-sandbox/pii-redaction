# pii-redaction

This is a [Nuxeo Studio](https://doc.nuxeo.com/n/dqH) Project to be used as a [multi-layer](https://doc.nuxeo.com/n/LVQ) dependency. The code is being stored in GitHub using the [External Source Repository](https://doc.nuxeo.com/n/ZB4) feature.

This project adds automated PII redaction, leveraging the [Nuxeo DLP Scanner](https://github.com/nuxeo-sandbox/nuxeo-dlp-scanner) plugin as well as [Nuxeo Enhanced Viewer](https://doc.nuxeo.com/n/QyI).

# Requirements

* [Nuxeo DLP Scanner](https://github.com/nuxeo-sandbox/nuxeo-dlp-scanner)
* [Nuxeo Enhanced Viewer](https://doc.nuxeo.com/n/QyI)

# Configuration

Follow the instructions for configuring the [Nuxeo DLP Scanner](https://github.com/nuxeo-sandbox/nuxeo-dlp-scanner) plugin.

You may want to disable the OOTB listeners via:

```
dlp.scan.enabled=false
```

# Usage

Two actions are provided:

* Sensitive Data Protection Scan - scans the Document for sensitive data and applies redaction
* Remove DLP Data - Deletes the results of the scan and removes the `DataLossPrevention` facet

A tab is provided for viewing the detection data.

A [Layout Block](https://doc.nuxeo.com/studio/ui-designer/#layout-blocks) named `piir-dlp-view` is provided that displays the detection data (can be used in other layouts, filters for the `DataLossPrevention` facet).