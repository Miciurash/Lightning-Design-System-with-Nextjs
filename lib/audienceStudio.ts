export type DonorRecord = {
  id: string;
  fullName: string;
  age: number;
  city: string;
  state: string;
  region: string;
  gender: string;
  ethnicity: string;
  religion: string;
  demographicSegment: string;
  incomeBand: string;
  donorTier: string;
  givingCapacity: string;
  totalGiving: number;
  lastGiftAmount: number;
  engagementScore: number;
  volunteer: boolean;
  preferredChannel: string;
  crmSource: string;
  affinityTags: string[];
};

export type FilterDescriptor = {
  id: string;
  label: string;
  matches: (donor: DonorRecord) => boolean;
};

export type SortDirection = "asc" | "desc";

export type SortState = {
  property:
    | "fullName"
    | "age"
    | "donorTier"
    | "totalGiving"
    | "engagementScore"
    | "crmSource";
  direction: SortDirection;
};

export type SidebarSignalId =
  | "volunteer"
  | "high-capacity"
  | "salesforce"
  | "recent-major-gift";

export type AudienceSelections = {
  regions: string[];
  tiers: string[];
  channels: string[];
  signals: SidebarSignalId[];
};

export type SelectionOption<T extends string = string> = {
  id: T;
  label: string;
  note: string;
};

export type FilterPill = {
  id: string;
  label: string;
  group: string;
};

export const promptExamples = [
  "Catholic donors over 50 in Texas with high engagement",
  "Young families in the northeast who prefer email",
  "Major donors interested in education with high capacity",
  "Volunteers under 40 in the southeast",
];

export const regionOptions: SelectionOption[] = [
  {
    id: "Northeast",
    label: "Northeast",
    note: "Metro donor bases and cultural institutions.",
  },
  {
    id: "Southeast",
    label: "Southeast",
    note: "Family-oriented and volunteer-heavy supporters.",
  },
  {
    id: "South",
    label: "South",
    note: "High-touch major donor relationships.",
  },
  {
    id: "Midwest",
    label: "Midwest",
    note: "Community-driven recurring support.",
  },
  {
    id: "West",
    label: "West",
    note: "Tech and innovation-aligned households.",
  },
  {
    id: "Southwest",
    label: "Southwest",
    note: "Growth markets with younger professionals.",
  },
];

export const tierOptions: SelectionOption[] = [
  {
    id: "Major",
    label: "Major",
    note: "High-value supporters ready for bespoke outreach.",
  },
  {
    id: "Leadership",
    label: "Leadership",
    note: "Board-adjacent and campaign anchor donors.",
  },
  {
    id: "Recurring",
    label: "Recurring",
    note: "Predictable annualized value and retention potential.",
  },
  {
    id: "Planned Giving",
    label: "Planned Giving",
    note: "Long-horizon stewardship and estate framing.",
  },
  {
    id: "Emerging",
    label: "Emerging",
    note: "Earlier-stage donors with upside.",
  },
];

export const channelOptions: SelectionOption[] = [
  {
    id: "Email",
    label: "Email",
    note: "Faster testing and tighter follow-up loops.",
  },
  {
    id: "Phone",
    label: "Phone",
    note: "Best for personal stewardship and major asks.",
  },
  {
    id: "SMS",
    label: "SMS",
    note: "Works for event nudges and rapid-response asks.",
  },
  {
    id: "Direct Mail",
    label: "Direct Mail",
    note: "Useful for premium storytelling and cultivation.",
  },
];

export const signalOptions: SelectionOption<SidebarSignalId>[] = [
  {
    id: "volunteer",
    label: "Volunteer",
    note: "Prior service indicates higher activation potential.",
  },
  {
    id: "high-capacity",
    label: "High Capacity",
    note: "Filters to donors with stronger giving headroom.",
  },
  {
    id: "salesforce",
    label: "Salesforce CRM",
    note: "Keeps the audience in the primary CRM lane.",
  },
  {
    id: "recent-major-gift",
    label: "Recent Gift $10k+",
    note: "Surfaces momentum from a recent significant gift.",
  },
];

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "based",
  "by",
  "create",
  "crm",
  "data",
  "donor",
  "donors",
  "find",
  "for",
  "from",
  "have",
  "in",
  "into",
  "list",
  "me",
  "of",
  "on",
  "people",
  "show",
  "that",
  "the",
  "their",
  "using",
  "who",
  "with",
]);

const categoricalRules: Array<{
  id: string;
  label: string;
  phrases: string[];
  matches: (donor: DonorRecord) => boolean;
}> = [
  {
    id: "religion:catholic",
    label: "Religion: Catholic",
    phrases: ["catholic"],
    matches: (donor) => donor.religion === "Catholic",
  },
  {
    id: "religion:baptist",
    label: "Religion: Baptist",
    phrases: ["baptist"],
    matches: (donor) => donor.religion === "Baptist",
  },
  {
    id: "religion:jewish",
    label: "Religion: Jewish",
    phrases: ["jewish"],
    matches: (donor) => donor.religion === "Jewish",
  },
  {
    id: "religion:muslim",
    label: "Religion: Muslim",
    phrases: ["muslim"],
    matches: (donor) => donor.religion === "Muslim",
  },
  {
    id: "religion:hindu",
    label: "Religion: Hindu",
    phrases: ["hindu"],
    matches: (donor) => donor.religion === "Hindu",
  },
  {
    id: "gender:female",
    label: "Gender: Female",
    phrases: ["female", "women", "woman"],
    matches: (donor) => donor.gender === "Female",
  },
  {
    id: "gender:male",
    label: "Gender: Male",
    phrases: ["male", "men", "man"],
    matches: (donor) => donor.gender === "Male",
  },
  {
    id: "gender:nonbinary",
    label: "Gender: Nonbinary",
    phrases: ["nonbinary", "non-binary"],
    matches: (donor) => donor.gender === "Nonbinary",
  },
  {
    id: "ethnicity:black",
    label: "Ethnicity: Black",
    phrases: ["black"],
    matches: (donor) => donor.ethnicity === "Black",
  },
  {
    id: "ethnicity:asian",
    label: "Ethnicity: Asian",
    phrases: ["asian"],
    matches: (donor) => donor.ethnicity === "Asian",
  },
  {
    id: "ethnicity:latino",
    label: "Ethnicity: Latino/a",
    phrases: ["latino", "latina", "hispanic"],
    matches: (donor) =>
      donor.ethnicity === "Latino" || donor.ethnicity === "Latina",
  },
  {
    id: "segment:young-families",
    label: "Segment: Young families",
    phrases: ["young families"],
    matches: (donor) => donor.demographicSegment === "Young families",
  },
  {
    id: "segment:young-professionals",
    label: "Segment: Young professionals",
    phrases: ["young professionals"],
    matches: (donor) => donor.demographicSegment === "Young professionals",
  },
  {
    id: "segment:tech-professionals",
    label: "Segment: Tech professionals",
    phrases: ["tech professionals"],
    matches: (donor) => donor.demographicSegment === "Tech professionals",
  },
  {
    id: "segment:retired",
    label: "Segment: Retired community leaders",
    phrases: ["retired", "retired community leaders"],
    matches: (donor) =>
      donor.demographicSegment === "Retired community leaders",
  },
  {
    id: "tier:major",
    label: "Tier: Major",
    phrases: ["major donors", "major donor", "major"],
    matches: (donor) => donor.donorTier === "Major",
  },
  {
    id: "tier:leadership",
    label: "Tier: Leadership",
    phrases: ["leadership donors", "leadership"],
    matches: (donor) => donor.donorTier === "Leadership",
  },
  {
    id: "tier:recurring",
    label: "Tier: Recurring",
    phrases: ["recurring", "monthly", "recurring donors"],
    matches: (donor) => donor.donorTier === "Recurring",
  },
  {
    id: "tier:planned",
    label: "Tier: Planned giving",
    phrases: ["planned giving", "legacy donors", "legacy giving"],
    matches: (donor) => donor.donorTier === "Planned Giving",
  },
  {
    id: "capacity:high",
    label: "Capacity: High",
    phrases: ["high capacity", "high net worth"],
    matches: (donor) => donor.givingCapacity === "High",
  },
  {
    id: "capacity:medium",
    label: "Capacity: Medium",
    phrases: ["medium capacity"],
    matches: (donor) => donor.givingCapacity === "Medium",
  },
  {
    id: "channel:email",
    label: "Channel: Email",
    phrases: ["prefer email", "email"],
    matches: (donor) => donor.preferredChannel === "Email",
  },
  {
    id: "channel:phone",
    label: "Channel: Phone",
    phrases: ["prefer phone", "phone"],
    matches: (donor) => donor.preferredChannel === "Phone",
  },
  {
    id: "channel:sms",
    label: "Channel: SMS",
    phrases: ["prefer sms", "sms", "text"],
    matches: (donor) => donor.preferredChannel === "SMS",
  },
  {
    id: "channel:direct-mail",
    label: "Channel: Direct mail",
    phrases: ["direct mail", "mail"],
    matches: (donor) => donor.preferredChannel === "Direct Mail",
  },
  {
    id: "volunteer:true",
    label: "Volunteers",
    phrases: ["volunteer", "volunteers"],
    matches: (donor) => donor.volunteer,
  },
  {
    id: "region:northeast",
    label: "Region: Northeast",
    phrases: ["northeast"],
    matches: (donor) => donor.region === "Northeast",
  },
  {
    id: "region:southeast",
    label: "Region: Southeast",
    phrases: ["southeast"],
    matches: (donor) => donor.region === "Southeast",
  },
  {
    id: "region:south",
    label: "Region: South",
    phrases: ["south"],
    matches: (donor) => donor.region === "South",
  },
  {
    id: "region:midwest",
    label: "Region: Midwest",
    phrases: ["midwest"],
    matches: (donor) => donor.region === "Midwest",
  },
  {
    id: "region:west",
    label: "Region: West",
    phrases: ["west coast", "west"],
    matches: (donor) => donor.region === "West",
  },
  {
    id: "region:southwest",
    label: "Region: Southwest",
    phrases: ["southwest"],
    matches: (donor) => donor.region === "Southwest",
  },
  {
    id: "state:texas",
    label: "State: Texas",
    phrases: ["texas"],
    matches: (donor) => donor.state === "Texas",
  },
  {
    id: "state:georgia",
    label: "State: Georgia",
    phrases: ["georgia"],
    matches: (donor) => donor.state === "Georgia",
  },
  {
    id: "state:california",
    label: "State: California",
    phrases: ["california"],
    matches: (donor) => donor.state === "California",
  },
  {
    id: "state:new-york",
    label: "State: New York",
    phrases: ["new york"],
    matches: (donor) => donor.state === "New York",
  },
  {
    id: "state:florida",
    label: "State: Florida",
    phrases: ["florida"],
    matches: (donor) => donor.state === "Florida",
  },
  {
    id: "state:pennsylvania",
    label: "State: Pennsylvania",
    phrases: ["pennsylvania"],
    matches: (donor) => donor.state === "Pennsylvania",
  },
  {
    id: "crm:salesforce",
    label: "CRM: Salesforce",
    phrases: ["salesforce"],
    matches: (donor) => donor.crmSource === "Salesforce",
  },
  {
    id: "crm:hubspot",
    label: "CRM: HubSpot",
    phrases: ["hubspot"],
    matches: (donor) => donor.crmSource === "HubSpot",
  },
  {
    id: "affinity:education",
    label: "Affinity: Education",
    phrases: ["education", "scholarships", "schools"],
    matches: (donor) =>
      donor.affinityTags.some((tag) => /education|scholarships/i.test(tag)),
  },
  {
    id: "affinity:healthcare",
    label: "Affinity: Healthcare",
    phrases: ["healthcare", "health", "community health", "hospice"],
    matches: (donor) =>
      donor.affinityTags.some(
        (tag) => /health/i.test(tag) || /hospice/i.test(tag),
      ),
  },
  {
    id: "affinity:arts",
    label: "Affinity: Arts",
    phrases: ["arts", "culture", "cultural"],
    matches: (donor) =>
      donor.affinityTags.some((tag) => /arts|cultural/i.test(tag)),
  },
  {
    id: "affinity:climate",
    label: "Affinity: Climate",
    phrases: ["climate", "environment"],
    matches: (donor) =>
      donor.affinityTags.some((tag) => /climate|environment/i.test(tag)),
  },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export const unique = <T>(items: T[]) => Array.from(new Set(items));

export const commonValue = (items: string[]) => {
  if (items.length === 0) {
    return "None";
  }

  const counts = items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item] = (accumulator[item] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0];
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9$\s-]/g, " ");

const parseMoney = (rawValue: string) => Number(rawValue.replace(/[$,]/g, ""));

const createKeywordFilter = (keywords: string[]): FilterDescriptor | null => {
  if (keywords.length === 0) {
    return null;
  }

  return {
    id: `keyword:${keywords.join("-")}`,
    label: `Keywords: ${keywords.join(", ")}`,
    matches: (donor) => {
      const blob = normalize(
        [
          donor.fullName,
          donor.city,
          donor.state,
          donor.region,
          donor.gender,
          donor.ethnicity,
          donor.religion,
          donor.demographicSegment,
          donor.incomeBand,
          donor.donorTier,
          donor.givingCapacity,
          donor.preferredChannel,
          donor.crmSource,
          ...donor.affinityTags,
        ].join(" "),
      );

      return keywords.every((keyword) => blob.includes(keyword));
    },
  };
};

export const parsePrompt = (query: string): FilterDescriptor[] => {
  const trimmedQuery = normalize(query);
  if (!trimmedQuery.trim()) {
    return [];
  }

  const filters = new Map<string, FilterDescriptor>();
  let residualQuery = trimmedQuery;

  const addFilter = (filter: FilterDescriptor, pattern?: RegExp) => {
    filters.set(filter.id, filter);
    if (pattern) {
      residualQuery = residualQuery.replace(pattern, " ");
    }
  };

  const ageBetween = residualQuery.match(
    /age\s+between\s+(\d{1,3})\s+and\s+(\d{1,3})/,
  );
  if (ageBetween) {
    const minimum = Number(ageBetween[1]);
    const maximum = Number(ageBetween[2]);
    addFilter(
      {
        id: `age-between-${minimum}-${maximum}`,
        label: `Age ${minimum}-${maximum}`,
        matches: (donor) => donor.age >= minimum && donor.age <= maximum,
      },
      /age\s+between\s+\d{1,3}\s+and\s+\d{1,3}/,
    );
  }

  const ageAbove = residualQuery.match(
    /(?:age\s+)?(?:over|above|older than|greater than)\s+(\d{1,3})/,
  );
  if (ageAbove) {
    const minimum = Number(ageAbove[1]);
    addFilter(
      {
        id: `age-min-${minimum}`,
        label: `Age over ${minimum}`,
        matches: (donor) => donor.age > minimum,
      },
      /(?:age\s+)?(?:over|above|older than|greater than)\s+\d{1,3}/,
    );
  }

  const ageBelow = residualQuery.match(
    /(?:age\s+)?(?:under|below|younger than|less than)\s+(\d{1,3})/,
  );
  if (ageBelow) {
    const maximum = Number(ageBelow[1]);
    addFilter(
      {
        id: `age-max-${maximum}`,
        label: `Age under ${maximum}`,
        matches: (donor) => donor.age < maximum,
      },
      /(?:age\s+)?(?:under|below|younger than|less than)\s+\d{1,3}/,
    );
  }

  const givingAbove = residualQuery.match(
    /(?:total\s+giving|giving|donations?)\s+(?:over|above|more than|greater than)\s+([$\d,]+)/,
  );
  if (givingAbove) {
    const minimum = parseMoney(givingAbove[1]);
    addFilter(
      {
        id: `giving-min-${minimum}`,
        label: `Total giving over ${formatCurrency(minimum)}`,
        matches: (donor) => donor.totalGiving > minimum,
      },
      /(?:total\s+giving|giving|donations?)\s+(?:over|above|more than|greater than)\s+[$\d,]+/,
    );
  }

  const givingBelow = residualQuery.match(
    /(?:total\s+giving|giving|donations?)\s+(?:under|below|less than)\s+([$\d,]+)/,
  );
  if (givingBelow) {
    const maximum = parseMoney(givingBelow[1]);
    addFilter(
      {
        id: `giving-max-${maximum}`,
        label: `Total giving under ${formatCurrency(maximum)}`,
        matches: (donor) => donor.totalGiving < maximum,
      },
      /(?:total\s+giving|giving|donations?)\s+(?:under|below|less than)\s+[$\d,]+/,
    );
  }

  const engagementAbove = residualQuery.match(
    /engagement(?:\s+score)?\s+(?:over|above|more than|greater than)\s+(\d{1,3})/,
  );
  if (engagementAbove) {
    const minimum = Number(engagementAbove[1]);
    addFilter(
      {
        id: `engagement-min-${minimum}`,
        label: `Engagement above ${minimum}`,
        matches: (donor) => donor.engagementScore > minimum,
      },
      /engagement(?:\s+score)?\s+(?:over|above|more than|greater than)\s+\d{1,3}/,
    );
  }

  const engagementBelow = residualQuery.match(
    /engagement(?:\s+score)?\s+(?:under|below|less than)\s+(\d{1,3})/,
  );
  if (engagementBelow) {
    const maximum = Number(engagementBelow[1]);
    addFilter(
      {
        id: `engagement-max-${maximum}`,
        label: `Engagement under ${maximum}`,
        matches: (donor) => donor.engagementScore < maximum,
      },
      /engagement(?:\s+score)?\s+(?:under|below|less than)\s+\d{1,3}/,
    );
  }

  if (/high\s+engagement/.test(residualQuery)) {
    addFilter(
      {
        id: "engagement-high",
        label: "High engagement",
        matches: (donor) => donor.engagementScore >= 80,
      },
      /high\s+engagement/,
    );
  }

  if (/low\s+engagement/.test(residualQuery)) {
    addFilter(
      {
        id: "engagement-low",
        label: "Low engagement",
        matches: (donor) => donor.engagementScore <= 60,
      },
      /low\s+engagement/,
    );
  }

  const sortedRules = [...categoricalRules].sort(
    (left, right) =>
      Math.max(...right.phrases.map((phrase) => phrase.length)) -
      Math.max(...left.phrases.map((phrase) => phrase.length)),
  );

  sortedRules.forEach((rule) => {
    const matchedPhrase = rule.phrases.find((phrase) => {
      if (phrase.includes(" ")) {
        return residualQuery.includes(phrase);
      }

      return new RegExp(
        `\\b${phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
      ).test(residualQuery);
    });

    if (!matchedPhrase || filters.has(rule.id)) {
      return;
    }

    addFilter(
      {
        id: rule.id,
        label: rule.label,
        matches: rule.matches,
      },
      matchedPhrase.includes(" ")
        ? new RegExp(
            matchedPhrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
            "g",
          )
        : new RegExp(
            `\\b${matchedPhrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
            "g",
          ),
    );
  });

  const keywords = unique(
    residualQuery
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !stopWords.has(token)),
  );
  const keywordFilter = createKeywordFilter(keywords);
  if (keywordFilter) {
    filters.set(keywordFilter.id, keywordFilter);
  }

  return Array.from(filters.values());
};

export const sortDonors = (items: DonorRecord[], sortState: SortState) => {
  const sortedItems = [...items];

  sortedItems.sort((left, right) => {
    const leftValue = left[sortState.property];
    const rightValue = right[sortState.property];

    let comparison = 0;

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      comparison = leftValue - rightValue;
    } else {
      comparison = String(leftValue).localeCompare(String(rightValue));
    }

    return sortState.direction === "asc" ? comparison : comparison * -1;
  });

  return sortedItems;
};

export const buildSidebarFilters = (
  selections: AudienceSelections,
): FilterDescriptor[] => {
  const filters: FilterDescriptor[] = [];

  if (selections.regions.length > 0) {
    filters.push({
      id: `sidebar-region:${selections.regions.join("|")}`,
      label: `Regions: ${selections.regions.join(", ")}`,
      matches: (donor) => selections.regions.includes(donor.region),
    });
  }

  if (selections.tiers.length > 0) {
    filters.push({
      id: `sidebar-tier:${selections.tiers.join("|")}`,
      label: `Tiers: ${selections.tiers.join(", ")}`,
      matches: (donor) => selections.tiers.includes(donor.donorTier),
    });
  }

  if (selections.channels.length > 0) {
    filters.push({
      id: `sidebar-channel:${selections.channels.join("|")}`,
      label: `Channels: ${selections.channels.join(", ")}`,
      matches: (donor) => selections.channels.includes(donor.preferredChannel),
    });
  }

  const signalFilters: Record<SidebarSignalId, FilterDescriptor> = {
    volunteer: {
      id: "sidebar-signal:volunteer",
      label: "Volunteer",
      matches: (donor) => donor.volunteer,
    },
    "high-capacity": {
      id: "sidebar-signal:high-capacity",
      label: "High capacity",
      matches: (donor) => donor.givingCapacity === "High",
    },
    salesforce: {
      id: "sidebar-signal:salesforce",
      label: "Salesforce CRM",
      matches: (donor) => donor.crmSource === "Salesforce",
    },
    "recent-major-gift": {
      id: "sidebar-signal:recent-major-gift",
      label: "Recent gift $10k+",
      matches: (donor) => donor.lastGiftAmount >= 10000,
    },
  };

  selections.signals.forEach((signalId) => {
    filters.push(signalFilters[signalId]);
  });

  return filters;
};

export const buildSidebarPills = (
  selections: AudienceSelections,
): FilterPill[] => [
  ...selections.regions.map((region) => ({
    id: `pill-region:${region}`,
    label: region,
    group: "Region",
  })),
  ...selections.tiers.map((tier) => ({
    id: `pill-tier:${tier}`,
    label: tier,
    group: "Tier",
  })),
  ...selections.channels.map((channel) => ({
    id: `pill-channel:${channel}`,
    label: channel,
    group: "Channel",
  })),
  ...selections.signals.map((signalId) => ({
    id: `pill-signal:${signalId}`,
    label:
      signalOptions.find((signal) => signal.id === signalId)?.label ?? signalId,
    group: "Signal",
  })),
];
