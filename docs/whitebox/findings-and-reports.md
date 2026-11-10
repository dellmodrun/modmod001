---
title: Findings and reports
description: Export findings or download a report.
url: https://www.hacktron.ai/docs/whitebox/findings-and-reports
---

# Findings and reports

Open a completed scan in **Whitebox Scans**. **View findings** lists the pentest's findings, and **Download report** at the top of the scan page downloads a PDF report.

## Export findings

::::steps

### Choose the findings

On the scan, click **View findings** to open the **Findings** page filtered to that scan. Narrow the list with search or with filters such as severity, status, or repository.

To export individual findings, select their checkboxes. With nothing selected, the export includes every matching finding across all pages.

### Choose a format

Click **Export**, or **Export N selected** if you selected rows, then choose one of:

- **Download CSV** for spreadsheets
- **Download SARIF** for tools that accept SARIF security results
- **Download JSON** for structured finding data

![The Export menu on Findings, with Download CSV, Download SARIF, and Download JSON](https://www.hacktron.ai/shots/whitebox/findings-and-reports/whitebox_findings_export/light.d1d266a4.webp)

::::

## Download a report

On the scan page, open **Download report** and choose one of:

- **Full Whitebox Report**, the detailed assessment and findings, with technical evidence and recommendations
- **Executive Report**, a shorter report with the risk assessment, key findings, and next steps

Both are PDFs. The Executive Report is available for completed scans with findings. If Formant still has to prepare its summary, the PDF downloads once it is ready.

### Example report

The contents page of the Full Whitebox Report links to each section and finding. This example uses sample data.

![Contents of a sample Full Whitebox Report: executive summary, scope, findings summary, methodology, severity rubric, individual findings, and limitations](https://www.hacktron.ai/shots/whitebox/findings-and-reports/whitebox_report_contents/light.f2ab593a.webp)

## Reports after a retest

After Formant completes a [retest](/docs/whitebox/retests), **Download report** has two groups:

- **Original scan**, the report as delivered before the retest
- **After retest**, the updated report with the verification results

Choose a report under the group you need. Both updated reports include a retest summary and an updated risk rating. In the updated full report, each fixed finding also has a **Fix Note** alongside its original technical details.

![Download report with the Original scan and After retest groups, each offering Full Whitebox Report and Executive Report](https://www.hacktron.ai/shots/whitebox/findings-and-reports/whitebox_retest_reports/light.109b74df.webp)

:::note
Some older scans have no saved original report or executive summary. If the original is unavailable, download the **After retest** edition instead.
:::

For a letter that confirms the engagement, [ask us for an attestation letter](/docs/whitebox/attestation-letters).
