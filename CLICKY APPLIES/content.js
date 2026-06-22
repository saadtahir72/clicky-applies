// content.js - Detects job title, company, and URL from job pages and general pages.

(function () {
  const COMPANY_FROM_HOST_BLOCKLIST = [
    "linkedin",
    "indeed",
    "glassdoor",
    "greenhouse",
    "lever",
    "workday",
    "myworkdayjobs",
    "workable",
    "ashbyhq",
    "wellfound",
    "builtin",
    "icims",
    "applytojob",
    "google",
    "bing"
  ];

  const detectors = {
    "linkedin.com": () => ({
      jobTitle: textFromSelectors([
        ".job-details-jobs-unified-top-card__job-title h1",
        ".jobs-unified-top-card__job-title h1",
        "h1.t-24",
        "h1"
      ]),
      company: textFromSelectors([
        ".job-details-jobs-unified-top-card__company-name a",
        ".jobs-unified-top-card__company-name a",
        ".topcard__org-name-link",
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name"
      ])
    }),
    "indeed.com": () => ({
      jobTitle: textFromSelectors([
        "[data-testid='jobsearch-JobInfoHeader-title']",
        "h1.jobsearch-JobInfoHeader-title",
        "h1"
      ]),
      company: textFromSelectors([
        "[data-testid='inlineHeader-companyName'] a",
        "[data-testid='inlineHeader-companyName']",
        ".jobsearch-CompanyReview--heading"
      ])
    }),
    "myworkdayjobs.com": () => ({
      jobTitle: textFromSelectors([
        "[data-automation-id='jobPostingHeader']",
        "h1",
        "h2.css-19uc56f"
      ]),
      company: textFromSelectors([
        "[data-automation-id='subtitle']",
        "[data-automation-id='jobPostingCompany']",
        ".css-1q2dra3"
      ])
    }),
    "greenhouse.io": () => ({
      jobTitle: textFromSelectors([
        "h1.app-title",
        "#header h1",
        "h1[class*='title']",
        "h1"
      ]),
      company: textFromSelectors([
        ".company-name",
        "h2.company",
        "#header .company"
      ])
    }),
    "lever.co": () => ({
      jobTitle: textFromSelectors([
        ".posting-headline h2",
        "h2[data-qa='posting-name']",
        "h1",
        "h2"
      ]),
      company: textFromSelectors([
        ".posting-headline h3",
        ".main-header-logo img"
      ], ["alt"])
    }),
    "workable.com": () => ({
      jobTitle: textFromSelectors([
        "h1[data-ui='job-title']",
        "h1.job-title",
        "h1"
      ]),
      company: textFromSelectors([
        "[data-ui='company-name']",
        ".company-name"
      ])
    }),
    "builtin.com": () => ({
      jobTitle: textFromSelectors([
        "h1[class*='title']",
        ".job-info h1",
        "h1.font-barlow",
        "h1"
      ]),
      company: textFromSelectors([
        "[class*='company-name']",
        ".company-title",
        "h2[class*='company']"
      ])
    }),
    "glassdoor.com": () => ({
      jobTitle: textFromSelectors([
        "[data-test='job-title']",
        "h1.title",
        "h1"
      ]),
      company: textFromSelectors([
        "[data-test='employer-name']",
        ".employerName"
      ])
    }),
    "ashbyhq.com": () => ({
      jobTitle: textFromSelectors([
        "h1.ashby-job-posting-heading",
        "h1[class*='jobPosting']",
        "h1"
      ]),
      company: textFromSelectors([
        "h2.ashby-job-posting-company",
        "[class*='companyName']"
      ])
    }),
    "wellfound.com": () => ({
      jobTitle: textFromSelectors([
        "h1[class*='title']",
        ".job-title h1",
        "h1"
      ]),
      company: textFromSelectors([
        "[class*='company'] h2",
        ".company-name"
      ])
    }),
    "icims.com": () => ({
      jobTitle: textFromSelectors([
        "h1.iCIMS_JobHeader",
        "h1[id*='jobtitle']",
        "h1"
      ]),
      company: textFromSelectors([
        ".iCIMS_EmployerInfo",
        "[class*='company']"
      ])
    }),
    "applytojob.com": () => ({
      jobTitle: textFromSelectors([
        "h1.job-header-title",
        "h1[class*='title']",
        "h1"
      ]),
      company: textFromSelectors([
        ".company-name",
        "[class*='company']"
      ])
    })
  };

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\bnew\b$/i, "")
      .trim();
  }

  function isGoodText(value) {
    const text = cleanText(value);
    return text && text.length >= 2 && text.length <= 160;
  }

  function textFromSelectors(selectors, attributes) {
    const attrs = attributes || ["textContent", "innerText", "content", "aria-label", "title", "alt"];

    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const node of nodes) {
        for (const attr of attrs) {
          const value = attr === "textContent" || attr === "innerText"
            ? node[attr]
            : node.getAttribute(attr);

          if (isGoodText(value)) {
            return cleanText(value);
          }
        }
      }
    }

    return "";
  }

  function metaContent(names) {
    for (const name of names) {
      const selector = [
        `meta[property="${name}"]`,
        `meta[name="${name}"]`,
        `meta[itemprop="${name}"]`
      ].join(",");
      const value = document.querySelector(selector)?.getAttribute("content");
      if (isGoodText(value)) return cleanText(value);
    }

    return "";
  }

  function getJsonLdJobInfo() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of scripts) {
      try {
        const parsed = JSON.parse(script.textContent || "{}");
        const items = Array.isArray(parsed) ? parsed : [parsed];
        const queue = items.slice();

        while (queue.length) {
          const item = queue.shift();
          if (!item || typeof item !== "object") continue;

          if (Array.isArray(item["@graph"])) {
            queue.push(...item["@graph"]);
          }

          const type = Array.isArray(item["@type"]) ? item["@type"].join(" ") : item["@type"];
          if (String(type || "").toLowerCase().includes("jobposting")) {
            const organization = item.hiringOrganization || item.organization || {};
            return {
              jobTitle: cleanText(item.title || item.name),
              company: cleanText(organization.name || organization.legalName)
            };
          }
        }
      } catch (e) {}
    }

    return { jobTitle: "", company: "" };
  }

  function getHostKey() {
    const host = window.location.hostname.replace(/^www\./, "");
    return Object.keys(detectors).find((key) => host.includes(key));
  }

  function titleParts() {
    const title = cleanText(document.title);
    if (!title) return [];
    return title
      .split(/\s(?:-|–|—|\||@| at | careers at | jobs at )\s/i)
      .map(cleanText)
      .filter(Boolean);
  }

  function guessCompanyFromHost() {
    const host = window.location.hostname.replace(/^www\./, "");
    const parts = host.split(".").filter(Boolean);
    const label = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    if (!label || COMPANY_FROM_HOST_BLOCKLIST.includes(label.toLowerCase())) return "";
    return label
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  }

  function genericDetect() {
    const jsonLd = getJsonLdJobInfo();
    const parts = titleParts();

    const jobTitle = jsonLd.jobTitle ||
      textFromSelectors([
        "[data-testid*='job'][data-testid*='title']",
        "[data-test*='job'][data-test*='title']",
        "[class*='job'][class*='title']",
        "[id*='job'][id*='title']",
        "[class*='posting'][class*='title']",
        "[id*='posting'][id*='title']",
        "h1"
      ]) ||
      metaContent(["og:title", "twitter:title", "title"]) ||
      parts[0] ||
      "";

    const company = jsonLd.company ||
      textFromSelectors([
        "[data-testid*='company']",
        "[data-test*='company']",
        "[class*='company-name']",
        "[class*='companyName']",
        "[class*='employer']",
        "[id*='company']",
        "[id*='employer']",
        "a[href*='/company/']",
        "a[href*='/companies/']"
      ]) ||
      metaContent(["og:site_name", "application-name"]) ||
      parts[1] ||
      guessCompanyFromHost() ||
      "";

    return {
      jobTitle: cleanText(jobTitle),
      company: cleanText(company)
    };
  }

  function detectJobInfo() {
    const result = {
      jobTitle: "",
      company: "",
      url: window.location.href
    };

    const key = getHostKey();
    if (key) {
      try {
        const detected = detectors[key]();
        result.jobTitle = cleanText(detected.jobTitle);
        result.company = cleanText(detected.company);
      } catch (e) {}
    }

    const generic = genericDetect();
    if (!result.jobTitle) result.jobTitle = generic.jobTitle;
    if (!result.company) result.company = generic.company;

    return result;
  }

  window.__CLICKY_DETECT_JOB_INFO = detectJobInfo;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "GET_JOB_INFO") {
      sendResponse(detectJobInfo());
    }
  });
})();
