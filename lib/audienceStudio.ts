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

export type PromptHighlightKind =
  | "field"
  | "value"
  | "semantic"
  | "numeric"
  | "keyword";

export type PromptHighlight = {
  id: string;
  start: number;
  end: number;
  kind: PromptHighlightKind;
  label: string;
  filterId?: string;
  canonicalValue?: string;
};

export type PromptAnalysis = {
  filters: FilterDescriptor[];
  highlights: PromptHighlight[];
  keywordTerms: string[];
  hasStructuredPrompt: boolean;
};

export type SlashFieldId =
  | "region"
  | "state"
  | "religion"
  | "segment"
  | "tier"
  | "capacity"
  | "channel"
  | "crm"
  | "affinity"
  | "age"
  | "giving"
  | "engagement"
  | "volunteer";

export type SlashFieldDefinition = {
  id: SlashFieldId;
  label: string;
  description: string;
  placeholder: string;
  aliases: string[];
  examples: string[];
  valueType: "enum" | "number" | "boolean";
};

export type SlashFieldSuggestion = SlashFieldDefinition & {
  score: number;
  insertText: string;
};

export type SlashValueSuggestion = {
  id: string;
  fieldId: SlashFieldId;
  label: string;
  note: string;
  score: number;
  insertText: string;
  semantic: boolean;
};

type TextRange = {
  start: number;
  end: number;
};

export type SlashContext = {
  start: number;
  end: number;
  fieldToken: string;
  fieldRange: TextRange | null;
  resolvedFieldId: SlashFieldId | null;
  valueText: string;
  valueRange: TextRange | null;
  mode: "field" | "value";
};

type EnumValueDefinition = {
  id: string;
  label: string;
  note: string;
  aliases: string[];
  naturalPhrases: string[];
  filterId?: string;
  filterLabel?: string;
  matches: (donor: DonorRecord) => boolean;
};

type FieldDefinitionBase = SlashFieldDefinition & {
  filterPrefix: string;
};

type EnumFieldDefinition = FieldDefinitionBase & {
  valueType: "enum" | "boolean";
  values: EnumValueDefinition[];
};

type NumericSuggestionDefinition = {
  id: string;
  label: string;
  note: string;
  insertText: string;
  aliases: string[];
};

type NumericMatch = {
  filter: FilterDescriptor;
  start: number;
  end: number;
  label: string;
  kind: "numeric" | "semantic";
  canonicalValue?: string;
};

type NumericFieldDefinition = FieldDefinitionBase & {
  valueType: "number";
  suggestions: NumericSuggestionDefinition[];
  parse: (text: string, offset?: number, fieldScoped?: boolean) => NumericMatch[];
};

type FieldDefinition = EnumFieldDefinition | NumericFieldDefinition;

type PhraseRule = {
  filter: FilterDescriptor;
  canonicalValue: string;
  phrases: Array<{
    text: string;
    semantic: boolean;
  }>;
};

type PhraseMatch = {
  value: EnumValueDefinition;
  start: number;
  end: number;
  semantic: boolean;
  score: number;
};

type SlashClause = {
  start: number;
  end: number;
  fieldToken: string;
  fieldRange: TextRange | null;
  resolvedFieldId: SlashFieldId | null;
  valueText: string;
  valueRange: TextRange | null;
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
  "about",
  "and",
  "are",
  "audience",
  "based",
  "brief",
  "by",
  "care",
  "capacity",
  "channel",
  "create",
  "crm",
  "data",
  "donor",
  "donors",
  "engagement",
  "expect",
  "field",
  "fields",
  "filter",
  "filters",
  "find",
  "for",
  "from",
  "giving",
  "have",
  "in",
  "into",
  "list",
  "me",
  "need",
  "of",
  "on",
  "people",
  "prefer",
  "prioritize",
  "prompt",
  "region",
  "results",
  "search",
  "segment",
  "show",
  "state",
  "that",
  "the",
  "their",
  "tier",
  "using",
  "values",
  "volunteer",
  "want",
  "who",
  "with",
]);

const escapeRegExp = (value: string) =>
  value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9$\s-]/g, " ");

const normalizeComparable = (value: string) =>
  normalize(value).replace(/\s+/g, " ").trim();

const slugify = (value: string) =>
  normalizeComparable(value).replace(/\s+/g, "-").replace(/^-+|-+$/g, "");

const uniqueStrings = (items: string[]) =>
  Array.from(new Set(items.filter(Boolean).map((item) => item.trim())));

const createValue = (
  config: Omit<EnumValueDefinition, "id" | "aliases" | "naturalPhrases"> & {
    id?: string;
    aliases?: string[];
    naturalPhrases?: string[];
  },
): EnumValueDefinition => ({
  id: config.id ?? slugify(config.label),
  label: config.label,
  note: config.note,
  aliases: uniqueStrings([config.label, ...(config.aliases ?? [])]),
  naturalPhrases: uniqueStrings(
    config.naturalPhrases
      ? [config.label, ...config.naturalPhrases]
      : [config.label, ...(config.aliases ?? [])],
  ),
  filterId: config.filterId,
  filterLabel: config.filterLabel,
  matches: config.matches,
});

const createAffinityMatcher = (pattern: RegExp) => (donor: DonorRecord) =>
  donor.affinityTags.some((tag) => pattern.test(tag));

const buildEnumFilter = (
  field: EnumFieldDefinition,
  value: EnumValueDefinition,
): FilterDescriptor => ({
  id: value.filterId ?? `${field.id}:${value.id}`,
  label: value.filterLabel ?? `${field.filterPrefix}: ${value.label}`,
  matches: value.matches,
});

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export const unique = <T,>(items: T[]) => Array.from(new Set(items));

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

const parseMoneyValue = (rawValue: string) => {
  const trimmed = rawValue
    .toLowerCase()
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "");

  if (!trimmed) {
    return 0;
  }

  const multiplier = trimmed.endsWith("m")
    ? 1_000_000
    : trimmed.endsWith("k")
      ? 1_000
      : 1;

  const numericPortion = multiplier === 1 ? trimmed : trimmed.slice(0, -1);

  return Math.round(Number(numericPortion) * multiplier);
};

const scanRegex = (
  text: string,
  pattern: RegExp,
  callback: (match: RegExpExecArray) => void,
) => {
  const source = normalize(text);
  const globalPattern = pattern.global
    ? new RegExp(pattern.source, pattern.flags)
    : new RegExp(pattern.source, `${pattern.flags}g`);

  let match = globalPattern.exec(source);

  while (match) {
    callback(match);
    match = globalPattern.exec(source);
  }
};

const pushNumericMatch = (items: NumericMatch[], nextMatch: NumericMatch) => {
  const exists = items.some(
    (item) =>
      item.filter.id === nextMatch.filter.id &&
      item.start === nextMatch.start &&
      item.end === nextMatch.end,
  );

  if (!exists) {
    items.push(nextMatch);
  }
};

const parseAgeMatches = (
  text: string,
  offset = 0,
  fieldScoped = false,
): NumericMatch[] => {
  const matches: NumericMatch[] = [];

  const addRange = (minimum: number, maximum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `age-between-${minimum}-${maximum}`,
        label: `Age ${minimum}-${maximum}`,
        matches: (donor) => donor.age >= minimum && donor.age <= maximum,
      },
      start: offset + start,
      end: offset + end,
      label: `Age ${minimum}-${maximum}`,
      kind: "numeric",
      canonicalValue: `${minimum}-${maximum}`,
    });

  const addMinimum = (minimum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `age-min-${minimum}`,
        label: `Age over ${minimum}`,
        matches: (donor) => donor.age > minimum,
      },
      start: offset + start,
      end: offset + end,
      label: `Age over ${minimum}`,
      kind: "numeric",
      canonicalValue: `${minimum}+`,
    });

  const addMaximum = (maximum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `age-max-${maximum}`,
        label: `Age under ${maximum}`,
        matches: (donor) => donor.age < maximum,
      },
      start: offset + start,
      end: offset + end,
      label: `Age under ${maximum}`,
      kind: "numeric",
      canonicalValue: `<${maximum}`,
    });

  if (fieldScoped) {
    scanRegex(text, /\b(\d{1,3})\s*(?:-|to)\s*(\d{1,3})\b/g, (match) => {
      addRange(
        Number(match[1]),
        Number(match[2]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });

    scanRegex(text, /\b(?:over|above|more than|greater than|older than)\s+(\d{1,3})\b/g, (match) => {
      addMinimum(
        Number(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });

    scanRegex(text, /\b(\d{1,3})\+\b/g, (match) => {
      addMinimum(
        Number(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });

    scanRegex(text, /\b(?:under|below|less than|younger than)\s+(\d{1,3})\b/g, (match) => {
      addMaximum(
        Number(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });
  }

  scanRegex(text, /\bage\s+between\s+(\d{1,3})\s+and\s+(\d{1,3})\b/g, (match) => {
    addRange(
      Number(match[1]),
      Number(match[2]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\bbetween\s+ages?\s+(\d{1,3})\s+and\s+(\d{1,3})\b/g, (match) => {
    addRange(
      Number(match[1]),
      Number(match[2]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\bage\s+(\d{1,3})\s*(?:-|to)\s*(\d{1,3})\b/g, (match) => {
    addRange(
      Number(match[1]),
      Number(match[2]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\bdonors?\s+(?:aged\s+)?(?:over|above)\s+(\d{1,3})\b/g, (match) => {
    addMinimum(
      Number(match[1]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\bage\s+(?:over|above|greater than|more than)\s+(\d{1,3})\b/g, (match) => {
    addMinimum(
      Number(match[1]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\bolder than\s+(\d{1,3})\b/g, (match) => {
    addMinimum(
      Number(match[1]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\bdonors?\s+(?:aged\s+)?(?:under|below)\s+(\d{1,3})\b/g, (match) => {
    addMaximum(
      Number(match[1]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\bage\s+(?:under|below|less than)\s+(\d{1,3})\b/g, (match) => {
    addMaximum(
      Number(match[1]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  scanRegex(text, /\byounger than\s+(\d{1,3})\b/g, (match) => {
    addMaximum(
      Number(match[1]),
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
    );
  });

  return matches;
};

const parseGivingMatches = (
  text: string,
  offset = 0,
  fieldScoped = false,
): NumericMatch[] => {
  const matches: NumericMatch[] = [];
  const moneyToken = "\\$?\\s?\\d[\\d,]*(?:\\.\\d+)?\\s*[km]?";

  const addRange = (
    minimum: number,
    maximum: number,
    start: number,
    end: number,
  ) =>
    pushNumericMatch(matches, {
      filter: {
        id: `giving-between-${minimum}-${maximum}`,
        label: `Total giving ${formatCurrency(minimum)}-${formatCurrency(maximum)}`,
        matches: (donor) =>
          donor.totalGiving >= minimum && donor.totalGiving <= maximum,
      },
      start: offset + start,
      end: offset + end,
      label: `Total giving ${formatCurrency(minimum)}-${formatCurrency(maximum)}`,
      kind: "numeric",
      canonicalValue: `${minimum}-${maximum}`,
    });

  const addMinimum = (minimum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `giving-min-${minimum}`,
        label: `Total giving over ${formatCurrency(minimum)}`,
        matches: (donor) => donor.totalGiving > minimum,
      },
      start: offset + start,
      end: offset + end,
      label: `Total giving over ${formatCurrency(minimum)}`,
      kind: "numeric",
      canonicalValue: `${minimum}+`,
    });

  const addMaximum = (maximum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `giving-max-${maximum}`,
        label: `Total giving under ${formatCurrency(maximum)}`,
        matches: (donor) => donor.totalGiving < maximum,
      },
      start: offset + start,
      end: offset + end,
      label: `Total giving under ${formatCurrency(maximum)}`,
      kind: "numeric",
      canonicalValue: `<${maximum}`,
    });

  if (fieldScoped) {
    scanRegex(
      text,
      new RegExp(`\\b(${moneyToken})\\s*(?:-|to)\\s*(${moneyToken})\\b`, "g"),
      (match) => {
        addRange(
          parseMoneyValue(match[1]),
          parseMoneyValue(match[2]),
          match.index ?? 0,
          (match.index ?? 0) + match[0].length,
        );
      },
    );

    scanRegex(
      text,
      new RegExp(`\\b(?:over|above|more than|greater than)\\s+(${moneyToken})\\b`, "g"),
      (match) => {
        addMinimum(
          parseMoneyValue(match[1]),
          match.index ?? 0,
          (match.index ?? 0) + match[0].length,
        );
      },
    );

    scanRegex(text, new RegExp(`\\b(${moneyToken})\\+\\b`, "g"), (match) => {
      addMinimum(
        parseMoneyValue(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });

    scanRegex(
      text,
      new RegExp(`\\b(?:under|below|less than)\\s+(${moneyToken})\\b`, "g"),
      (match) => {
        addMaximum(
          parseMoneyValue(match[1]),
          match.index ?? 0,
          (match.index ?? 0) + match[0].length,
        );
      },
    );
  }

  scanRegex(
    text,
    new RegExp(
      `\\b(?:total\\s+giving|giving|donations?|lifetime\\s+giving)\\s+between\\s+(${moneyToken})\\s+and\\s+(${moneyToken})\\b`,
      "g",
    ),
    (match) => {
      addRange(
        parseMoneyValue(match[1]),
        parseMoneyValue(match[2]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  scanRegex(
    text,
    new RegExp(
      `\\b(?:total\\s+giving|giving|donations?|lifetime\\s+giving)\\s+(${moneyToken})\\s*(?:-|to)\\s*(${moneyToken})\\b`,
      "g",
    ),
    (match) => {
      addRange(
        parseMoneyValue(match[1]),
        parseMoneyValue(match[2]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  scanRegex(
    text,
    new RegExp(
      `\\b(?:total\\s+giving|giving|donations?|lifetime\\s+giving|gave)\\s+(?:over|above|more\\s+than|greater\\s+than)\\s+(${moneyToken})\\b`,
      "g",
    ),
    (match) => {
      addMinimum(
        parseMoneyValue(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  scanRegex(
    text,
    new RegExp(
      `\\b(?:total\\s+giving|giving|donations?|lifetime\\s+giving|gave)\\s+(?:under|below|less\\s+than)\\s+(${moneyToken})\\b`,
      "g",
    ),
    (match) => {
      addMaximum(
        parseMoneyValue(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  return matches;
};

const parseEngagementMatches = (
  text: string,
  offset = 0,
  fieldScoped = false,
): NumericMatch[] => {
  const matches: NumericMatch[] = [];

  const addRange = (minimum: number, maximum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `engagement-between-${minimum}-${maximum}`,
        label: `Engagement ${minimum}-${maximum}`,
        matches: (donor) =>
          donor.engagementScore >= minimum &&
          donor.engagementScore <= maximum,
      },
      start: offset + start,
      end: offset + end,
      label: `Engagement ${minimum}-${maximum}`,
      kind: "numeric",
      canonicalValue: `${minimum}-${maximum}`,
    });

  const addMinimum = (minimum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `engagement-min-${minimum}`,
        label: `Engagement above ${minimum}`,
        matches: (donor) => donor.engagementScore > minimum,
      },
      start: offset + start,
      end: offset + end,
      label: `Engagement above ${minimum}`,
      kind: "numeric",
      canonicalValue: `${minimum}+`,
    });

  const addMaximum = (maximum: number, start: number, end: number) =>
    pushNumericMatch(matches, {
      filter: {
        id: `engagement-max-${maximum}`,
        label: `Engagement under ${maximum}`,
        matches: (donor) => donor.engagementScore < maximum,
      },
      start: offset + start,
      end: offset + end,
      label: `Engagement under ${maximum}`,
      kind: "numeric",
      canonicalValue: `<${maximum}`,
    });

  const addSemantic = (
    id: string,
    label: string,
    canonicalValue: string,
    start: number,
    end: number,
    matcher: (donor: DonorRecord) => boolean,
  ) =>
    pushNumericMatch(matches, {
      filter: {
        id,
        label,
        matches: matcher,
      },
      start: offset + start,
      end: offset + end,
      label,
      kind: "semantic",
      canonicalValue,
    });

  if (fieldScoped) {
    scanRegex(text, /\b(\d{1,3})\s*(?:-|to)\s*(\d{1,3})\b/g, (match) => {
      addRange(
        Number(match[1]),
        Number(match[2]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });

    scanRegex(
      text,
      /\b(?:over|above|more than|greater than)\s+(\d{1,3})\b/g,
      (match) => {
        addMinimum(
          Number(match[1]),
          match.index ?? 0,
          (match.index ?? 0) + match[0].length,
        );
      },
    );

    scanRegex(text, /\b(\d{1,3})\+\b/g, (match) => {
      addMinimum(
        Number(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });

    scanRegex(text, /\b(?:under|below|less than)\s+(\d{1,3})\b/g, (match) => {
      addMaximum(
        Number(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    });

    scanRegex(text, /\bhigh\b/g, (match) => {
      addSemantic(
        "engagement-high",
        "High engagement",
        "High engagement",
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
        (donor) => donor.engagementScore >= 80,
      );
    });

    scanRegex(text, /\blow\b/g, (match) => {
      addSemantic(
        "engagement-low",
        "Low engagement",
        "Low engagement",
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
        (donor) => donor.engagementScore <= 75,
      );
    });
  }

  scanRegex(
    text,
    /\bengagement(?:\s+score)?\s+between\s+(\d{1,3})\s+and\s+(\d{1,3})\b/g,
    (match) => {
      addRange(
        Number(match[1]),
        Number(match[2]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  scanRegex(
    text,
    /\bengagement(?:\s+score)?\s+(\d{1,3})\s*(?:-|to)\s*(\d{1,3})\b/g,
    (match) => {
      addRange(
        Number(match[1]),
        Number(match[2]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  scanRegex(
    text,
    /\bengagement(?:\s+score)?\s+(?:over|above|more than|greater than)\s+(\d{1,3})\b/g,
    (match) => {
      addMinimum(
        Number(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  scanRegex(
    text,
    /\bengagement(?:\s+score)?\s+(?:under|below|less than)\s+(\d{1,3})\b/g,
    (match) => {
      addMaximum(
        Number(match[1]),
        match.index ?? 0,
        (match.index ?? 0) + match[0].length,
      );
    },
  );

  scanRegex(text, /\bhigh engagement\b/g, (match) => {
    addSemantic(
      "engagement-high",
      "High engagement",
      "High engagement",
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
      (donor) => donor.engagementScore >= 80,
    );
  });

  scanRegex(text, /\blow engagement\b/g, (match) => {
    addSemantic(
      "engagement-low",
      "Low engagement",
      "Low engagement",
      match.index ?? 0,
      (match.index ?? 0) + match[0].length,
      (donor) => donor.engagementScore <= 75,
    );
  });

  return matches;
};

const regionField: EnumFieldDefinition = {
  id: "region",
  label: "Region",
  filterPrefix: "Region",
  description: "Geographic cluster for the audience.",
  placeholder: "west coast, northeast, southwest",
  aliases: ["geography", "market", "location"],
  examples: ["/region west coast", "/region northeast"],
  valueType: "enum",
  values: [
    createValue({
      label: "Northeast",
      note: "Metro donor bases and institutional markets.",
      aliases: ["north east", "east coast"],
      matches: (donor) => donor.region === "Northeast",
    }),
    createValue({
      label: "Southeast",
      note: "Family-oriented and volunteer-heavy supporters.",
      aliases: ["south east"],
      matches: (donor) => donor.region === "Southeast",
    }),
    createValue({
      label: "South",
      note: "Relationship-driven Southern donor clusters.",
      aliases: ["the south", "southern"],
      matches: (donor) => donor.region === "South",
    }),
    createValue({
      label: "Midwest",
      note: "Community-driven recurring support bases.",
      aliases: ["mid west", "heartland"],
      matches: (donor) => donor.region === "Midwest",
    }),
    createValue({
      label: "West",
      note: "West Coast and Pacific donor concentration.",
      aliases: ["west coast", "pacific"],
      matches: (donor) => donor.region === "West",
    }),
    createValue({
      label: "Southwest",
      note: "Southwest growth markets and younger professionals.",
      aliases: ["south west", "desert southwest"],
      matches: (donor) => donor.region === "Southwest",
    }),
  ],
};

const stateField: EnumFieldDefinition = {
  id: "state",
  label: "State",
  filterPrefix: "State",
  description: "Specific state-level geography.",
  placeholder: "Texas, California, New York",
  aliases: ["province", "market state"],
  examples: ["/state Texas", "/state California"],
  valueType: "enum",
  values: [
    createValue({
      label: "Arizona",
      note: "Arizona donors and desert southwest households.",
      matches: (donor) => donor.state === "Arizona",
    }),
    createValue({
      label: "California",
      note: "California coastal and metro donors.",
      matches: (donor) => donor.state === "California",
    }),
    createValue({
      label: "Colorado",
      note: "Colorado mountain and growth-market donors.",
      matches: (donor) => donor.state === "Colorado",
    }),
    createValue({
      label: "Florida",
      note: "Florida high-touch and retiree audiences.",
      matches: (donor) => donor.state === "Florida",
    }),
    createValue({
      label: "Georgia",
      note: "Georgia civic and faith-connected supporters.",
      matches: (donor) => donor.state === "Georgia",
    }),
    createValue({
      label: "Illinois",
      note: "Illinois metro and Midwest supporters.",
      matches: (donor) => donor.state === "Illinois",
    }),
    createValue({
      label: "Massachusetts",
      note: "Massachusetts education and healthcare donors.",
      matches: (donor) => donor.state === "Massachusetts",
    }),
    createValue({
      label: "Minnesota",
      note: "Minnesota community-led recurring audiences.",
      matches: (donor) => donor.state === "Minnesota",
    }),
    createValue({
      label: "New Jersey",
      note: "New Jersey Northeast donor clusters.",
      aliases: ["jersey"],
      matches: (donor) => donor.state === "New Jersey",
    }),
    createValue({
      label: "New York",
      note: "New York cultural and institutional donors.",
      aliases: ["nyc"],
      naturalPhrases: ["new york"],
      matches: (donor) => donor.state === "New York",
    }),
    createValue({
      label: "North Carolina",
      note: "North Carolina Southeast and growth-market donors.",
      naturalPhrases: ["north carolina"],
      matches: (donor) => donor.state === "North Carolina",
    }),
    createValue({
      label: "Ohio",
      note: "Ohio Midwest civic donor base.",
      matches: (donor) => donor.state === "Ohio",
    }),
    createValue({
      label: "Oregon",
      note: "Oregon Pacific and climate-aligned supporters.",
      matches: (donor) => donor.state === "Oregon",
    }),
    createValue({
      label: "Pennsylvania",
      note: "Pennsylvania Northeast community donors.",
      matches: (donor) => donor.state === "Pennsylvania",
    }),
    createValue({
      label: "Texas",
      note: "Texas major donor and faith-adjacent households.",
      matches: (donor) => donor.state === "Texas",
    }),
    createValue({
      label: "Washington",
      note: "Washington tech and Pacific audiences.",
      matches: (donor) => donor.state === "Washington",
    }),
  ],
};

const religionField: EnumFieldDefinition = {
  id: "religion",
  label: "Religion",
  filterPrefix: "Religion",
  description: "Faith tradition or secular audience signal.",
  placeholder: "Catholic, Jewish, None",
  aliases: ["faith", "belief"],
  examples: ["/religion Catholic", "/religion None"],
  valueType: "enum",
  values: [
    createValue({
      label: "Baptist",
      note: "Baptist faith profile.",
      matches: (donor) => donor.religion === "Baptist",
    }),
    createValue({
      label: "Catholic",
      note: "Catholic faith profile.",
      matches: (donor) => donor.religion === "Catholic",
    }),
    createValue({
      label: "Episcopal",
      note: "Episcopal faith profile.",
      matches: (donor) => donor.religion === "Episcopal",
    }),
    createValue({
      label: "Hindu",
      note: "Hindu faith profile.",
      matches: (donor) => donor.religion === "Hindu",
    }),
    createValue({
      label: "Jewish",
      note: "Jewish faith profile.",
      matches: (donor) => donor.religion === "Jewish",
    }),
    createValue({
      label: "Lutheran",
      note: "Lutheran faith profile.",
      matches: (donor) => donor.religion === "Lutheran",
    }),
    createValue({
      label: "Methodist",
      note: "Methodist faith profile.",
      matches: (donor) => donor.religion === "Methodist",
    }),
    createValue({
      label: "Muslim",
      note: "Muslim faith profile.",
      matches: (donor) => donor.religion === "Muslim",
    }),
    createValue({
      label: "None",
      note: "Secular or unaffiliated audience profile.",
      aliases: ["secular", "nonreligious", "not religious"],
      matches: (donor) => donor.religion === "None",
    }),
    createValue({
      label: "Presbyterian",
      note: "Presbyterian faith profile.",
      matches: (donor) => donor.religion === "Presbyterian",
    }),
    createValue({
      label: "Sikh",
      note: "Sikh faith profile.",
      matches: (donor) => donor.religion === "Sikh",
    }),
  ],
};

const segmentField: EnumFieldDefinition = {
  id: "segment",
  label: "Segment",
  filterPrefix: "Segment",
  description: "Household or life-stage segment.",
  placeholder: "young families, retired, tech professionals",
  aliases: ["demographic", "persona"],
  examples: ["/segment young families", "/segment retired"],
  valueType: "enum",
  values: [
    createValue({
      label: "Business owners",
      note: "Business-led households with giving leverage.",
      aliases: ["entrepreneurs", "owners"],
      matches: (donor) => donor.demographicSegment === "Business owners",
    }),
    createValue({
      label: "Retired community leaders",
      note: "Retired community stewards and civic leaders.",
      aliases: ["retired", "retirees", "community leaders"],
      matches: (donor) =>
        donor.demographicSegment === "Retired community leaders",
    }),
    createValue({
      label: "Tech professionals",
      note: "Technology-oriented professionals and households.",
      aliases: ["tech", "technology professionals"],
      matches: (donor) => donor.demographicSegment === "Tech professionals",
    }),
    createValue({
      label: "Urban professionals",
      note: "Metro working professionals with high activity.",
      aliases: ["urban"],
      matches: (donor) => donor.demographicSegment === "Urban professionals",
    }),
    createValue({
      label: "Young families",
      note: "Family-stage households with education and youth affinities.",
      aliases: ["families", "young parents"],
      matches: (donor) => donor.demographicSegment === "Young families",
    }),
    createValue({
      label: "Young professionals",
      note: "Emerging-career donors with growth upside.",
      aliases: ["emerging professionals"],
      matches: (donor) => donor.demographicSegment === "Young professionals",
    }),
  ],
};

const tierField: EnumFieldDefinition = {
  id: "tier",
  label: "Donor Tier",
  filterPrefix: "Tier",
  description: "Lifecycle or value tier for the donor.",
  placeholder: "major, recurring, planned giving",
  aliases: ["lifecycle", "donor tier"],
  examples: ["/tier major", "/tier planned giving"],
  valueType: "enum",
  values: [
    createValue({
      label: "Emerging",
      note: "Earlier-stage donors with upside.",
      aliases: ["new donors", "growth"],
      matches: (donor) => donor.donorTier === "Emerging",
    }),
    createValue({
      label: "Leadership",
      note: "Board-adjacent and anchor supporters.",
      aliases: ["leadership donors"],
      matches: (donor) => donor.donorTier === "Leadership",
    }),
    createValue({
      label: "Major",
      note: "High-value stewardship audiences.",
      aliases: ["major donor", "major donors"],
      matches: (donor) => donor.donorTier === "Major",
    }),
    createValue({
      label: "Planned Giving",
      note: "Legacy and estate-leaning donors.",
      aliases: ["legacy", "bequest", "estate planning", "legacy donors"],
      matches: (donor) => donor.donorTier === "Planned Giving",
    }),
    createValue({
      label: "Recurring",
      note: "Predictable subscription-style givers.",
      aliases: ["monthly", "recurring donors"],
      matches: (donor) => donor.donorTier === "Recurring",
    }),
  ],
};

const capacityField: EnumFieldDefinition = {
  id: "capacity",
  label: "Capacity",
  filterPrefix: "Capacity",
  description: "Estimated giving headroom or philanthropic capacity.",
  placeholder: "high capacity, medium, low",
  aliases: ["giving capacity", "wealth"],
  examples: ["/capacity high", "/capacity medium"],
  valueType: "enum",
  values: [
    createValue({
      label: "High",
      note: "Stronger giving headroom and bespoke ask potential.",
      aliases: ["high capacity", "high net worth", "affluent"],
      matches: (donor) => donor.givingCapacity === "High",
    }),
    createValue({
      label: "Medium",
      note: "Healthy giving upside with scaled stewardship.",
      aliases: ["medium capacity"],
      matches: (donor) => donor.givingCapacity === "Medium",
    }),
    createValue({
      label: "Low",
      note: "Lower giving ceiling and volume-oriented motion.",
      aliases: ["low capacity"],
      matches: (donor) => donor.givingCapacity === "Low",
    }),
  ],
};

const channelField: EnumFieldDefinition = {
  id: "channel",
  label: "Preferred Channel",
  filterPrefix: "Channel",
  description: "Best-performing outreach channel.",
  placeholder: "email, phone, text, direct mail",
  aliases: ["outreach channel", "response channel"],
  examples: ["/channel text", "/channel phone"],
  valueType: "enum",
  values: [
    createValue({
      label: "Email",
      note: "Faster testing and tighter follow-up loops.",
      aliases: ["email outreach", "inbox"],
      matches: (donor) => donor.preferredChannel === "Email",
    }),
    createValue({
      label: "Phone",
      note: "High-touch calls and stewardship conversations.",
      aliases: ["call", "calling", "phone outreach"],
      matches: (donor) => donor.preferredChannel === "Phone",
    }),
    createValue({
      label: "SMS",
      note: "Text-first nudges and rapid-response asks.",
      aliases: ["text", "texting", "sms outreach"],
      matches: (donor) => donor.preferredChannel === "SMS",
    }),
    createValue({
      label: "Direct Mail",
      note: "Postal storytelling and premium cultivation.",
      aliases: ["mail", "postal", "direct-mail"],
      matches: (donor) => donor.preferredChannel === "Direct Mail",
    }),
  ],
};

const crmField: EnumFieldDefinition = {
  id: "crm",
  label: "CRM Source",
  filterPrefix: "CRM",
  description: "Primary source system for the record.",
  placeholder: "Salesforce, HubSpot, Blackbaud",
  aliases: ["source system", "platform"],
  examples: ["/crm Salesforce", "/crm Raiser's Edge"],
  valueType: "enum",
  values: [
    createValue({
      label: "Blackbaud",
      note: "Blackbaud-managed donor records.",
      matches: (donor) => donor.crmSource === "Blackbaud",
    }),
    createValue({
      label: "Dynamics 365",
      note: "Dynamics-managed donor records.",
      aliases: ["dynamics", "microsoft dynamics"],
      matches: (donor) => donor.crmSource === "Dynamics 365",
    }),
    createValue({
      label: "HubSpot",
      note: "HubSpot-managed donor records.",
      matches: (donor) => donor.crmSource === "HubSpot",
    }),
    createValue({
      label: "Raiser's Edge",
      note: "Raiser's Edge managed donor records.",
      aliases: ["raisers edge", "re"],
      naturalPhrases: ["raiser s edge", "raisers edge"],
      matches: (donor) => donor.crmSource === "Raiser's Edge",
    }),
    createValue({
      label: "Salesforce",
      note: "Salesforce-managed donor records.",
      matches: (donor) => donor.crmSource === "Salesforce",
    }),
  ],
};

const affinityField: EnumFieldDefinition = {
  id: "affinity",
  label: "Affinity",
  filterPrefix: "Affinity",
  description: "Mission interest or topical leaning.",
  placeholder: "education, climate, healthcare, faith",
  aliases: ["interest", "issue", "theme"],
  examples: ["/affinity schools", "/affinity climate"],
  valueType: "enum",
  values: [
    createValue({
      label: "Education",
      note: "Education, scholarships, STEM, and youth learning.",
      aliases: ["schools", "school", "scholarships", "scholarship", "stem"],
      matches: createAffinityMatcher(
        /education|scholar|stem|early childhood|girls education|higher education|youth programs/i,
      ),
    }),
    createValue({
      label: "Healthcare",
      note: "Healthcare, hospice, and community health.",
      aliases: ["health", "community health", "hospice"],
      matches: createAffinityMatcher(/health|hospice/i),
    }),
    createValue({
      label: "Arts",
      note: "Arts, culture, and cultural access.",
      aliases: ["arts", "culture", "cultural"],
      matches: createAffinityMatcher(/arts|cultural/i),
    }),
    createValue({
      label: "Climate",
      note: "Climate and environmental causes.",
      aliases: ["environment", "environmental"],
      matches: createAffinityMatcher(/climate|environment/i),
    }),
    createValue({
      label: "Faith Partnerships",
      note: "Faith-connected community programs.",
      aliases: ["faith", "parish", "church outreach"],
      matches: createAffinityMatcher(/faith|parish/i),
    }),
    createValue({
      label: "Housing & Basic Needs",
      note: "Housing, food security, and mutual aid.",
      aliases: ["housing", "food security", "mutual aid", "basic needs", "hunger"],
      matches: createAffinityMatcher(/housing|food security|mutual aid/i),
    }),
    createValue({
      label: "Relief & Migration",
      note: "Disaster relief, refugee support, and immigration.",
      aliases: ["disaster relief", "refugee", "immigration", "refugee relief"],
      matches: createAffinityMatcher(/disaster relief|refugee relief|immigration/i),
    }),
    createValue({
      label: "Leadership & Mentorship",
      note: "Leadership development and mentorship programs.",
      aliases: ["leadership", "mentorship", "women in tech"],
      matches: createAffinityMatcher(/leadership|mentorship|women in tech/i),
    }),
    createValue({
      label: "Animal Welfare",
      note: "Animal welfare and rescue-oriented supporters.",
      aliases: ["animals", "animal rescue"],
      matches: createAffinityMatcher(/animal/i),
    }),
  ],
};

const volunteerField: EnumFieldDefinition = {
  id: "volunteer",
  label: "Volunteer History",
  filterPrefix: "Volunteer",
  description: "Whether the donor has volunteer activity.",
  placeholder: "yes, no",
  aliases: ["service", "volunteer flag"],
  examples: ["/volunteer yes", "/volunteer no"],
  valueType: "boolean",
  values: [
    createValue({
      label: "Yes",
      note: "Donors with volunteer history.",
      aliases: ["volunteer", "volunteers", "volunteered", "served"],
      naturalPhrases: ["volunteer", "volunteers", "volunteered", "served"],
      filterId: "volunteer:true",
      filterLabel: "Volunteer: Yes",
      matches: (donor) => donor.volunteer,
    }),
    createValue({
      label: "No",
      note: "Donors without volunteer history.",
      aliases: ["non volunteer", "not a volunteer"],
      naturalPhrases: ["non volunteer", "not a volunteer"],
      filterId: "volunteer:false",
      filterLabel: "Volunteer: No",
      matches: (donor) => !donor.volunteer,
    }),
  ],
};

const ageField: NumericFieldDefinition = {
  id: "age",
  label: "Age",
  filterPrefix: "Age",
  description: "Age-based donor filtering.",
  placeholder: "over 50, 40-60, under 35",
  aliases: ["older donors", "younger donors"],
  examples: ["/age over 50", "/age 40-60"],
  valueType: "number",
  suggestions: [
    {
      id: "age-over-50",
      label: "Over 50",
      note: "Donors older than 50.",
      insertText: "over 50",
      aliases: ["50+", "older than 50"],
    },
    {
      id: "age-range-40-60",
      label: "40-60",
      note: "Donors between ages 40 and 60.",
      insertText: "40-60",
      aliases: ["between 40 and 60"],
    },
    {
      id: "age-under-35",
      label: "Under 35",
      note: "Younger emerging donor cohorts.",
      insertText: "under 35",
      aliases: ["below 35", "younger than 35"],
    },
  ],
  parse: parseAgeMatches,
};

const givingField: NumericFieldDefinition = {
  id: "giving",
  label: "Total Giving",
  filterPrefix: "Total Giving",
  description: "Lifetime or total-giving constraint.",
  placeholder: "over $25k, $10k-$50k, under $5k",
  aliases: ["lifetime giving", "donations"],
  examples: ["/giving over $25k", "/giving $10k-$50k"],
  valueType: "number",
  suggestions: [
    {
      id: "giving-over-25k",
      label: "Over $25k",
      note: "Higher-value giving cohorts.",
      insertText: "over $25k",
      aliases: ["25k+", "more than $25,000"],
    },
    {
      id: "giving-range",
      label: "$10k-$50k",
      note: "Mid-to-major giving band.",
      insertText: "$10k-$50k",
      aliases: ["10k to 50k"],
    },
    {
      id: "giving-under-5k",
      label: "Under $5k",
      note: "Lower-lifetime-giving audience.",
      insertText: "under $5k",
      aliases: ["below $5k"],
    },
  ],
  parse: parseGivingMatches,
};

const engagementField: NumericFieldDefinition = {
  id: "engagement",
  label: "Engagement Score",
  filterPrefix: "Engagement",
  description: "Behavioral engagement score constraint.",
  placeholder: "high, over 80, under 75",
  aliases: ["score", "activity score"],
  examples: ["/engagement high", "/engagement over 80"],
  valueType: "number",
  suggestions: [
    {
      id: "engagement-high",
      label: "High",
      note: "Treat as high-engagement donors.",
      insertText: "high",
      aliases: ["high engagement", "80+"],
    },
    {
      id: "engagement-over-80",
      label: "Over 80",
      note: "Strong activity threshold.",
      insertText: "over 80",
      aliases: ["80+", "above 80"],
    },
    {
      id: "engagement-under-75",
      label: "Under 75",
      note: "Lower-engagement audience slice.",
      insertText: "under 75",
      aliases: ["below 75", "low engagement"],
    },
  ],
  parse: parseEngagementMatches,
};

const fieldDefinitions: FieldDefinition[] = [
  regionField,
  stateField,
  religionField,
  segmentField,
  tierField,
  capacityField,
  channelField,
  crmField,
  affinityField,
  ageField,
  givingField,
  engagementField,
  volunteerField,
];

const fieldDefinitionMap = new Map(
  fieldDefinitions.map((field) => [field.id, field]),
);

const phraseRules: PhraseRule[] = fieldDefinitions.flatMap((field) => {
  if (field.valueType === "number") {
    return [];
  }

  return field.values.map((value) => ({
    filter: buildEnumFilter(field, value),
    canonicalValue: value.label,
    phrases: uniqueStrings(value.naturalPhrases)
      .sort((left, right) => right.length - left.length)
      .map((text) => ({
        text,
        semantic:
          normalizeComparable(text) !== normalizeComparable(value.label),
      })),
  }));
});

export const slashFieldDefinitions: SlashFieldDefinition[] = fieldDefinitions.map(
  ({ id, label, description, placeholder, aliases, examples, valueType }) => ({
    id,
    label,
    description,
    placeholder,
    aliases,
    examples,
    valueType,
  }),
);

const getFieldDefinition = (fieldId: SlashFieldId) =>
  fieldDefinitionMap.get(fieldId) ?? null;

const scoreSearchTerm = (searchTerm: string, candidates: string[]) => {
  const needle = normalizeComparable(searchTerm);

  if (!needle) {
    return 1;
  }

  return candidates.reduce((bestScore, candidate) => {
    const haystack = normalizeComparable(candidate);

    if (!haystack) {
      return bestScore;
    }

    if (haystack === needle) {
      return Math.max(bestScore, 100);
    }

    if (haystack.startsWith(needle)) {
      return Math.max(bestScore, 88);
    }

    if (haystack.split(" ").some((token) => token.startsWith(needle))) {
      return Math.max(bestScore, 78);
    }

    if (haystack.includes(needle)) {
      return Math.max(bestScore, 68);
    }

    const needleTokens = needle.split(/\s+/).filter(Boolean);

    if (needleTokens.length > 1 && needleTokens.every((token) => haystack.includes(token))) {
      return Math.max(bestScore, 58);
    }

    return bestScore;
  }, 0);
};

const rankFieldDefinitions = (searchTerm: string) =>
  fieldDefinitions
    .map((field) => ({
      field,
      score: scoreSearchTerm(searchTerm, [
        field.id,
        field.label,
        ...field.aliases,
      ]),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score);

const resolveSlashFieldId = (fieldToken: string): SlashFieldId | null => {
  const needle = normalizeComparable(fieldToken);

  if (!needle) {
    return null;
  }

  const ranked = rankFieldDefinitions(fieldToken);
  const topMatch = ranked[0];
  const nextMatch = ranked[1];

  if (!topMatch) {
    return null;
  }

  const topCandidates = [
    topMatch.field.id,
    topMatch.field.label,
    ...topMatch.field.aliases,
  ];

  const isExact = topCandidates.some(
    (candidate) => normalizeComparable(candidate) === needle,
  );

  if (isExact) {
    return topMatch.field.id;
  }

  if (
    needle.length >= 3 &&
    topMatch.score >= 88 &&
    (!nextMatch || topMatch.score - nextMatch.score >= 10)
  ) {
    return topMatch.field.id;
  }

  return null;
};

const isSlashBoundary = (source: string, index: number) =>
  index === 0 || /[\s([{,]/.test(source[index - 1] ?? "");

const parseSlashFragment = (
  source: string,
  start: number,
  end: number,
): SlashClause => {
  const fragment = source.slice(start + 1, end);
  const leadingWhitespaceLength = fragment.match(/^\s*/)?.[0].length ?? 0;
  const trimmedFragment = fragment.slice(leadingWhitespaceLength);
  const fieldToken = trimmedFragment.match(/^([^\s/]*)/)?.[1] ?? "";
  const fieldTokenStart = start + 1 + leadingWhitespaceLength;

  const fieldRange =
    fieldToken.length > 0
      ? {
          start: fieldTokenStart,
          end: fieldTokenStart + fieldToken.length,
        }
      : null;

  let valueStart = fieldRange ? fieldRange.end : fieldTokenStart;

  while (valueStart < end && /\s/.test(source[valueStart] ?? "")) {
    valueStart += 1;
  }

  const valueText = source.slice(valueStart, end);

  return {
    start,
    end,
    fieldToken,
    fieldRange,
    resolvedFieldId: resolveSlashFieldId(fieldToken),
    valueText,
    valueRange: valueText
      ? {
          start: valueStart,
          end,
        }
      : null,
  };
};

const findNextSlashStart = (source: string, fromIndex: number) => {
  let cursor = fromIndex;

  while (cursor < source.length) {
    const slashIndex = source.indexOf("/", cursor);

    if (slashIndex === -1) {
      return -1;
    }

    if (isSlashBoundary(source, slashIndex)) {
      return slashIndex;
    }

    cursor = slashIndex + 1;
  }

  return -1;
};

const collectSlashClauses = (source: string) => {
  const clauses: SlashClause[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const slashStart = findNextSlashStart(source, cursor);

    if (slashStart === -1) {
      break;
    }

    const nextSlashStart = findNextSlashStart(source, slashStart + 1);
    const clauseEnd = nextSlashStart === -1 ? source.length : nextSlashStart;

    clauses.push(parseSlashFragment(source, slashStart, clauseEnd));
    cursor = clauseEnd;
  }

  return clauses;
};

const hasOverlap = (claimed: boolean[], start: number, end: number) => {
  for (let index = start; index < end; index += 1) {
    if (claimed[index]) {
      return true;
    }
  }

  return false;
};

const markRange = (claimed: boolean[], start: number, end: number) => {
  for (let index = start; index < end; index += 1) {
    claimed[index] = true;
  }
};

const collectPhraseMatches = (source: string, phrase: string): TextRange[] => {
  const normalizedPhrase = normalizeComparable(phrase);

  if (!normalizedPhrase) {
    return [];
  }

  const pattern = new RegExp(
    `\\b${escapeRegExp(normalizedPhrase).replace(/\s+/g, "\\s+")}\\b`,
    "g",
  );

  const matches: TextRange[] = [];
  let match = pattern.exec(source);

  while (match) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
    match = pattern.exec(source);
  }

  return matches;
};

const findBestValuePhraseMatch = (
  field: EnumFieldDefinition,
  valueText: string,
): PhraseMatch | null => {
  const normalizedText = normalize(valueText);
  let bestMatch: PhraseMatch | null = null;

  field.values.forEach((value) => {
    const phrases = uniqueStrings([value.label, ...value.aliases]).sort(
      (left, right) => right.length - left.length,
    );

    phrases.forEach((phrase) => {
      const matches = collectPhraseMatches(normalizedText, phrase);

      matches.forEach((match) => {
        const score =
          phrase.length * 10 +
          (normalizeComparable(valueText) === normalizeComparable(phrase)
            ? 100
            : 0) -
          match.start;

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            value,
            start: match.start,
            end: match.end,
            semantic:
              normalizeComparable(phrase) !== normalizeComparable(value.label),
            score,
          };
        }
      });
    });
  });

  return bestMatch;
};

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

const collectKeywordRanges = (source: string, claimed: boolean[]) => {
  const normalizedSource = normalize(source);
  const tokenPattern = /\b[a-z0-9$-]{3,}\b/g;
  const keywordRanges: Array<TextRange & { term: string }> = [];
  let match = tokenPattern.exec(normalizedSource);

  while (match) {
    const term = match[0].trim();
    const start = match.index;
    const end = start + match[0].length;

    if (!stopWords.has(term) && !hasOverlap(claimed, start, end)) {
      keywordRanges.push({ term, start, end });
    }

    match = tokenPattern.exec(normalizedSource);
  }

  return keywordRanges;
};

export const analyzePrompt = (query: string): PromptAnalysis => {
  const filters = new Map<string, FilterDescriptor>();
  const highlights: PromptHighlight[] = [];
  const claimed = Array(query.length).fill(false);
  const normalizedQuery = normalize(query);

  const addFilter = (filter: FilterDescriptor) => {
    filters.set(filter.id, filter);
  };

  const addHighlight = (
    start: number,
    end: number,
    kind: PromptHighlightKind,
    label: string,
    filterId?: string,
    canonicalValue?: string,
  ) => {
    if (start >= end || start < 0 || end > query.length) {
      return;
    }

    const exists = highlights.some(
      (highlight) =>
        highlight.start === start &&
        highlight.end === end &&
        highlight.kind === kind &&
        highlight.filterId === filterId,
    );

    if (exists) {
      return;
    }

    highlights.push({
      id: `${kind}-${start}-${end}-${filterId ?? slugify(label)}`,
      start,
      end,
      kind,
      label,
      filterId,
      canonicalValue,
    });
    markRange(claimed, start, end);
  };

  const slashClauses = collectSlashClauses(query);

  slashClauses.forEach((clause) => {
    if (clause.fieldRange) {
      markRange(claimed, clause.start, clause.fieldRange.end);
    }

    if (!clause.resolvedFieldId || !clause.fieldRange) {
      return;
    }

    const field = getFieldDefinition(clause.resolvedFieldId);

    if (!field) {
      return;
    }

    addHighlight(
      clause.start,
      clause.fieldRange.end,
      "field",
      field.label,
      undefined,
      field.label,
    );

    if (field.valueType === "number") {
      const numericMatches = field.parse(
        clause.valueText,
        clause.valueRange?.start ?? clause.end,
        true,
      );

      numericMatches.slice(0, 1).forEach((match) => {
        addFilter(match.filter);
        addHighlight(
          match.start,
          match.end,
          match.kind,
          match.label,
          match.filter.id,
          match.canonicalValue,
        );
      });

      return;
    }

    if (!clause.valueRange || !clause.valueText.trim()) {
      return;
    }

    const valueMatch = findBestValuePhraseMatch(field, clause.valueText);

    if (!valueMatch) {
      return;
    }

    const filter = buildEnumFilter(field, valueMatch.value);
    addFilter(filter);
    addHighlight(
      clause.valueRange.start + valueMatch.start,
      clause.valueRange.start + valueMatch.end,
      valueMatch.semantic ? "semantic" : "value",
      filter.label,
      filter.id,
      valueMatch.value.label,
    );
  });

  fieldDefinitions
    .filter(
      (field): field is NumericFieldDefinition => field.valueType === "number",
    )
    .forEach((field) => {
      field.parse(query).forEach((match) => {
        if (hasOverlap(claimed, match.start, match.end)) {
          return;
        }

        addFilter(match.filter);
        addHighlight(
          match.start,
          match.end,
          match.kind,
          match.label,
          match.filter.id,
          match.canonicalValue,
        );
      });
    });

  phraseRules.forEach((rule) => {
    const matchedPhrase = rule.phrases.find((phrase) => {
      const ranges = collectPhraseMatches(normalizedQuery, phrase.text).filter(
        (range) => !hasOverlap(claimed, range.start, range.end),
      );

      if (ranges.length === 0) {
        return false;
      }

      addFilter(rule.filter);

      ranges.forEach((range) => {
        addHighlight(
          range.start,
          range.end,
          phrase.semantic ? "semantic" : "value",
          rule.filter.label,
          rule.filter.id,
          rule.canonicalValue,
        );
      });

      return true;
    });

    if (!matchedPhrase) {
      return;
    }
  });

  const keywordRanges = collectKeywordRanges(query, claimed);
  const keywordTerms = unique(keywordRanges.map((range) => range.term));
  const keywordFilter = createKeywordFilter(keywordTerms);

  if (keywordFilter) {
    addFilter(keywordFilter);

    keywordRanges.forEach((range) => {
      addHighlight(
        range.start,
        range.end,
        "keyword",
        `Keyword: ${range.term}`,
        keywordFilter.id,
        range.term,
      );
    });
  }

  return {
    filters: Array.from(filters.values()),
    highlights: highlights.sort((left, right) => left.start - right.start),
    keywordTerms,
    hasStructuredPrompt: filters.size > 0,
  };
};

export const parsePrompt = (query: string): FilterDescriptor[] =>
  analyzePrompt(query).filters;

export const searchSlashFields = (query: string): SlashFieldSuggestion[] =>
  rankFieldDefinitions(query).map(({ field, score }) => ({
    id: field.id,
    label: field.label,
    description: field.description,
    placeholder: field.placeholder,
    aliases: field.aliases,
    examples: field.examples,
    valueType: field.valueType,
    score,
    insertText: `/${field.id} `,
  }));

export const searchSlashValues = (
  fieldId: SlashFieldId,
  query: string,
): SlashValueSuggestion[] => {
  const field = getFieldDefinition(fieldId);

  if (!field) {
    return [];
  }

  if (field.valueType === "number") {
    return field.suggestions
      .map((suggestion) => ({
        id: suggestion.id,
        fieldId,
        label: suggestion.label,
        note: suggestion.note,
        score: scoreSearchTerm(query, [
          suggestion.label,
          suggestion.insertText,
          ...suggestion.aliases,
        ]),
        insertText: suggestion.insertText,
        semantic:
          Boolean(query.trim()) &&
          normalizeComparable(query) !== normalizeComparable(suggestion.label),
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score);
  }

  return field.values
    .map((value) => ({
      id: value.id,
      fieldId,
      label: value.label,
      note: value.note,
      score: scoreSearchTerm(query, [value.label, ...value.aliases]),
      insertText: value.label,
      semantic:
        Boolean(query.trim()) &&
        normalizeComparable(query) !== normalizeComparable(value.label),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score);
};

export const findSlashContext = (
  query: string,
  caretIndex: number,
): SlashContext | null => {
  const safeCaret = Math.max(0, Math.min(caretIndex, query.length));

  for (let index = safeCaret - 1; index >= 0; index -= 1) {
    if (query[index] !== "/") {
      continue;
    }

    if (!isSlashBoundary(query, index)) {
      continue;
    }

    const clause = parseSlashFragment(query, index, safeCaret);

    return {
      start: clause.start,
      end: clause.end,
      fieldToken: clause.fieldToken,
      fieldRange: clause.fieldRange,
      resolvedFieldId: clause.resolvedFieldId,
      valueText: clause.valueText,
      valueRange: clause.valueRange,
      mode: clause.resolvedFieldId ? "value" : "field",
    };
  }

  return null;
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
