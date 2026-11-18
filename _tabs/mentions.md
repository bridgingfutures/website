---
title: Mentions
icon: fas fa-at
order: 2
permalink: /mentions/
layout: page
---

<!-- Tabulator dependencies -->
<link id="tabulator-css-light" rel="stylesheet" href="https://unpkg.com/tabulator-tables@6.2.5/dist/css/tabulator.min.css">
<link id="tabulator-css-dark" rel="stylesheet" href="https://unpkg.com/tabulator-tables@6.2.5/dist/css/tabulator_midnight.min.css" disabled>

<script src="https://unpkg.com/tabulator-tables@6.2.5/dist/js/tabulator.min.js"></script>
<script src="{{ '/assets/js/mentions-table.js' | relative_url }}?v=19"></script>

<style>
  /* The following styles are scoped to the Mentions page via this file. */

  /* Hide the automatic page title (the page has its own heading). */
  h1.dynamic-title,
  header .post-title { display: none; }

  /* Hide the theme's right-hand sidebar. */
  #panel-wrapper { display: none !important; }

  /* Full-width content and footer. */
  main.col-xl-9,
  main.col-lg-11,
  main.col-12 {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  #tail-wrapper.col-xl-9,
  #tail-wrapper.col-lg-11 {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  @media (min-width: 1200px) {
    .container.px-xxl-5 {
      padding-left: 1.25rem !important;
      padding-right: 1.25rem !important;
    }
  }

  /* Avoid an artificial gap between a short/filtered table and the footer.
     Chirpy stretches the page content row to fill the viewport by default. */
  #main-wrapper > .container {
    min-height: 0 !important;
    height: auto !important;
  }

  #main-wrapper > .container > .row.flex-grow-1 {
    flex: 0 0 auto !important;
    min-height: 0 !important;
    align-content: flex-start !important;
  }

  #main-wrapper > .container > .row.flex-grow-1 > main {
    min-height: 0 !important;
    height: auto !important;
  }

  /* The tracker has no fixed-height scrolling pane: shrink it with the rows.
     Do not change Tabulator's horizontal overflow or row positioning. */
  #mentions-table.tabulator {
    height: auto !important;
    min-height: 0 !important;
  }

  #mentions-table .tabulator-tableholder {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
  }

  #mentions-table .tabulator-table {
    min-height: 0 !important;
  }

  /* Quote cell layout and source icon. */
  .mentions-quote {
    display: flex;
    align-items: flex-start;
    gap: .5rem;
  }

  .mentions-quote-text {
    flex: 1;
    white-space: normal;
    overflow-wrap: anywhere;
    line-height: 1.35;
  }

  .mentions-open {
    flex: 0 0 auto;
    opacity: .8;
    text-decoration: none;
    transform: translateY(2px);
  }

  .mentions-open:hover { opacity: 1; }
  .mentions-open i { font-size: .95rem; }

  /* Tabulator header filter popups. */
  .bf-hpop {
    padding: .75rem;
    width: 280px;
    max-width: 80vw;
  }

  .bf-hpop .bf-title {
    font-weight: 600;
    margin-bottom: .5rem;
  }

  .bf-hpop .bf-input {
    width: 100%;
    padding: .4rem .5rem;
    border-radius: .5rem;
    border: 1px solid rgba(127,127,127,.65);
    background: transparent;
    color: inherit;
    outline: none;
  }

  .bf-hpop .bf-actions {
    display: flex;
    gap: .5rem;
    margin-top: .5rem;
  }

  .bf-hpop .bf-btn {
    padding: .25rem .5rem;
    border-radius: .5rem;
    border: 1px solid rgba(127,127,127,.70);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .bf-hpop .bf-list {
    margin-top: .5rem;
    max-height: none;
    overflow-y: visible;
    border: 1px solid rgba(127,127,127,.65);
    border-radius: .5rem;
    padding: .25rem;
  }

  .bf-hpop .bf-list.bf-scroll { overflow-y: auto; }

  .bf-hpop .bf-item {
    display: flex;
    gap: .5rem;
    align-items: center;
    padding: .25rem .35rem;
    border: 1px solid rgba(127,127,127,.40);
    border-radius: .4rem;
    user-select: none;
  }

  .bf-hpop .bf-item:hover {
    border-color: rgba(127,127,127,.70);
    background: rgba(127,127,127,.12);
  }

  .bf-hpop .bf-item input { margin: 0; }

  .tabulator .tabulator-header-popup-button { opacity: .65; }
  .tabulator .tabulator-col.bf-filtered .tabulator-header-popup-button { opacity: 1; }

  /* Wrap names, houses, parties and actions instead of truncating them. */
  .tabulator .tabulator-cell[tabulator-field="name"],
  .tabulator .tabulator-cell[tabulator-field="house"],
  .tabulator .tabulator-cell[tabulator-field="party"],
  .tabulator .tabulator-cell[tabulator-field="action_type"] {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
  }

  .tabulator .tabulator-col[tabulator-field="name"] .tabulator-col-title,
  .tabulator .tabulator-col[tabulator-field="house"] .tabulator-col-title,
  .tabulator .tabulator-col[tabulator-field="party"] .tabulator-col-title,
  .tabulator .tabulator-col[tabulator-field="action_type"] .tabulator-col-title {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }

  .tabulator .tabulator-cell {
    line-height: 1.35 !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
  }
</style>

# Parliamentary mentions tracker

Here we collect parliamentary mentions and actions focused on long-term stability for people on the UK Ukraine schemes.

{% include mentions-table.html %}
