import type { NextPage } from "next";
import Head from "next/head";
import {
    type ComponentType,
    type PropsWithChildren,
    useMemo,
    useState,
} from "react";

import Button from "@salesforce/design-system-react/components/button";
import ButtonGroup from "@salesforce/design-system-react/components/button-group";
import Card from "@salesforce/design-system-react/components/card";
import DataTable from "@salesforce/design-system-react/components/data-table";
import DataTableColumn from "@salesforce/design-system-react/components/data-table/column";
import Dropdown from "@salesforce/design-system-react/components/menu-dropdown/menu-dropdown";
import Icon from "@salesforce/design-system-react/components/icon";
import Input from "@salesforce/design-system-react/components/input";
import InputSearch from "@salesforce/design-system-react/components/input/search";
import PageHeader from "@salesforce/design-system-react/components/page-header";
import PageHeaderControl from "@salesforce/design-system-react/components/page-header/control";
import PillContainer from "@salesforce/design-system-react/components/pill-container";

import donorData from "../data/cdp.json";
import styles from "../styles/DonorBuilder.module.css";

const TypedPageHeaderControl = PageHeaderControl as ComponentType<
    PropsWithChildren<{
        className?: string | string[] | Record<string, unknown>;
    }>
>;

const TypedInputSearch = InputSearch as ComponentType<{
    assistiveText?: { label?: string };
    id?: string;
    label?: string;
    onChange?: (_event: unknown, data: { value: string }) => void;
    onClear?: () => void;
    placeholder?: string;
    value?: string;
}>;

const TypedDataTable = DataTable as ComponentType<
    PropsWithChildren<{
        id?: string;
        items?: Array<Record<string, unknown>>;
        joined?: boolean;
        onSort?: (sortData: {
            property: string;
            sortDirection: SortDirection;
        }) => void;
        search?: string;
        stackedHorizontal?: boolean;
    }>
>;

type DonorRecord = {
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

type FilterDescriptor = {
    id: string;
    label: string;
    matches: (donor: DonorRecord) => boolean;
};

type SortDirection = "asc" | "desc";

type SortState = {
    property:
    | "fullName"
    | "age"
    | "donorTier"
    | "totalGiving"
    | "engagementScore"
    | "crmSource";
    direction: SortDirection;
};

type SavedList = {
    name: string;
    createdAt: string;
    count: number;
    criteria: string[];
    averageGift: string;
    topTraits: string[];
};

const donors = donorData as DonorRecord[];

const promptExamples = [
    "Catholic donors over 50 in Texas with high engagement",
    "Young families in the northeast who prefer email",
    "Major donors interested in education with high capacity",
    "Volunteers under 40 in the southeast",
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

const defaultSort: SortState = {
    property: "engagementScore",
    direction: "desc",
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const commonValue = (items: string[]) => {
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

const parsePrompt = (query: string): FilterDescriptor[] => {
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

const sortDonors = (items: DonorRecord[], sortState: SortState) => {
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

const Home: NextPage = () => {
    const [listName, setListName] = useState("Spring Faith & Family Outreach");
    const [query, setQuery] = useState(promptExamples[0]);
    const [dismissedFilterIds, setDismissedFilterIds] = useState<string[]>([]);
    const [sortState, setSortState] = useState<SortState>(defaultSort);
    const [savedList, setSavedList] = useState<SavedList | null>(null);

    const parsedFilters = useMemo(() => parsePrompt(query), [query]);

    const activeFilters = useMemo(
        () =>
            parsedFilters.filter((filter) => !dismissedFilterIds.includes(filter.id)),
        [dismissedFilterIds, parsedFilters],
    );

    const filteredDonors = useMemo(
        () =>
            donors.filter((donor) =>
                activeFilters.every((filter) => filter.matches(donor)),
            ),
        [activeFilters],
    );

    const sortedDonors = useMemo(
        () => sortDonors(filteredDonors, sortState),
        [filteredDonors, sortState],
    );

    const totalGiving = useMemo(
        () => filteredDonors.reduce((sum, donor) => sum + donor.totalGiving, 0),
        [filteredDonors],
    );

    const averageAge = useMemo(() => {
        if (filteredDonors.length === 0) {
            return "-";
        }

        const totalAge = filteredDonors.reduce((sum, donor) => sum + donor.age, 0);
        return `${Math.round(totalAge / filteredDonors.length)}`;
    }, [filteredDonors]);

    const dominantRegion = useMemo(
        () => commonValue(filteredDonors.map((donor) => donor.region)),
        [filteredDonors],
    );

    const averageEngagement = useMemo(() => {
        if (filteredDonors.length === 0) {
            return "-";
        }

        const totalScore = filteredDonors.reduce(
            (sum, donor) => sum + donor.engagementScore,
            0,
        );
        return `${Math.round(totalScore / filteredDonors.length)}`;
    }, [filteredDonors]);

    const pillOptions = activeFilters.map((filter) => ({
        id: filter.id,
        label: filter.label,
        title: filter.label,
    }));

    const tableItems = sortedDonors.map((donor) => ({
        id: donor.id,
        fullName: donor.fullName,
        age: donor.age,
        location: `${donor.city}, ${donor.state}`,
        demographic: `${donor.ethnicity} · ${donor.demographicSegment}`,
        religion: donor.religion,
        donorTier: donor.donorTier,
        totalGiving: formatCurrency(donor.totalGiving),
        engagementScore: donor.engagementScore,
        preferredChannel: donor.preferredChannel,
        crmSource: donor.crmSource,
    }));

    const infoText = `${filteredDonors.length} donors • mocked from cdp.json • source systems include Salesforce and other CRMs`;

    const handleApplyPrompt = (nextPrompt?: string) => {
        if (typeof nextPrompt === "string") {
            setQuery(nextPrompt);
        }

        setDismissedFilterIds([]);
    };

    const handleSort = (sortData: {
        property: string;
        sortDirection: SortDirection;
    }) => {
        if (
            sortData.property === "fullName" ||
            sortData.property === "age" ||
            sortData.property === "donorTier" ||
            sortData.property === "totalGiving" ||
            sortData.property === "engagementScore" ||
            sortData.property === "crmSource"
        ) {
            setSortState({
                property: sortData.property,
                direction: sortData.sortDirection,
            });
        }
    };

    const handleCreateList = () => {
        const effectiveName =
            listName.trim() || `Donor List ${new Date().toLocaleDateString("en-US")}`;

        setSavedList({
            name: effectiveName,
            createdAt: new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }),
            count: filteredDonors.length,
            criteria: activeFilters.map((filter) => filter.label),
            averageGift:
                filteredDonors.length > 0
                    ? formatCurrency(Math.round(totalGiving / filteredDonors.length))
                    : formatCurrency(0),
            topTraits: unique(
                filteredDonors.flatMap((donor) => donor.affinityTags),
            ).slice(0, 4),
        });
    };

    return (
        <div className={styles.page}>
            <Head>
                <title>Donor List Builder</title>
                <meta
                    name="description"
                    content="Create donor lists from mocked CRM and Salesforce-style CDP data using natural language."
                />
            </Head>

            <main className={styles.shell}>
                <PageHeader
                    icon={
                        <Icon
                            assistiveText={{ label: "Donors" }}
                            category="standard"
                            name="lead"
                        />
                    }
                    info={infoText}
                    joined
                    label="Donor Segments"
                    title="Natural Language List Builder"
                    variant="object-home"
                    onRenderActions={() => (
                        <TypedPageHeaderControl>
                            <ButtonGroup id="donor-list-builder-actions" variant="list">
                                <Button
                                    label="Create List"
                                    variant="brand"
                                    onClick={handleCreateList}
                                />
                                <Dropdown
                                    align="right"
                                    assistiveText={{ icon: "More Options" }}
                                    iconCategory="utility"
                                    iconName="down"
                                    iconVariant="border-filled"
                                    id="donor-list-builder-more-actions"
                                    options={[
                                        { label: "Export matching donors", value: "export" },
                                        { label: "Share criteria internally", value: "share" },
                                        { label: "Schedule refresh", value: "refresh" },
                                    ]}
                                />
                            </ButtonGroup>
                        </TypedPageHeaderControl>
                    )}
                    onRenderControls={() => (
                        <>
                            <TypedPageHeaderControl>
                                <Button
                                    assistiveText={{ icon: "Reset filters" }}
                                    iconCategory="utility"
                                    iconName="refresh"
                                    iconVariant="border-filled"
                                    label="Reset"
                                    onClick={() => {
                                        setDismissedFilterIds([]);
                                        setQuery("");
                                        setSortState(defaultSort);
                                    }}
                                />
                            </TypedPageHeaderControl>
                        </>
                    )}
                />

                <Card
                    className={styles.heroCard}
                    heading="Build a donor audience"
                    hasNoHeader
                >
                    <div className={styles.heroBody}>
                        <div className={styles.heroIntro}>
                            <p className={styles.eyebrow}>Mocked CDP Workflow</p>
                            <h1 className={styles.heroTitle}>
                                Describe the donors you want in plain English.
                            </h1>
                            <p className={styles.heroText}>
                                This page assumes donor profiles have already been unified into
                                a mocked cdp.json file sourced from Salesforce and adjacent CRM
                                systems. The prompt parser turns phrases like age, demographic
                                segment, religion, geography, giving behavior, and channel
                                preference into filterable list criteria.
                            </p>

                            <div className={styles.controlGrid}>
                                <div className={styles.fieldRow}>
                                    <Input
                                        id="donor-list-name"
                                        label="List name"
                                        onChange={(_event: unknown, data: { value: string }) =>
                                            setListName(data.value)
                                        }
                                        value={listName}
                                    />
                                    <TypedInputSearch
                                        id="donor-list-query"
                                        assistiveText={{ label: "Describe the audience" }}
                                        label="Natural language criteria"
                                        onChange={(_event: unknown, data: { value: string }) =>
                                            setQuery(data.value)
                                        }
                                        onClear={() => setQuery("")}
                                        placeholder="Example: Catholic donors over 50 in Texas with high engagement"
                                        value={query}
                                    />
                                </div>

                                <div className={styles.queryActions}>
                                    <Button
                                        label="Interpret Criteria"
                                        variant="brand"
                                        onClick={() => handleApplyPrompt()}
                                    />
                                    <Button
                                        label="Save Snapshot"
                                        variant="neutral"
                                        onClick={handleCreateList}
                                    />
                                </div>

                                <p className={styles.helperText}>
                                    Supported phrases include age ranges, donor tier, religion,
                                    ethnicity, demographic segment, region or state, engagement,
                                    total giving, preferred channel, volunteering, affinity areas,
                                    and CRM source.
                                </p>
                            </div>
                        </div>

                        <aside className={styles.examplesPanel}>
                            <h2 className={styles.examplesTitle}>Suggested prompts</h2>
                            <p className={styles.examplesText}>
                                Use these to test the mocked data and the natural-language
                                parser.
                            </p>
                            <div className={styles.promptList}>
                                {promptExamples.map((prompt) => (
                                    <Button
                                        key={prompt}
                                        label={prompt}
                                        onClick={() => handleApplyPrompt(prompt)}
                                        variant="neutral"
                                    />
                                ))}
                            </div>
                        </aside>
                    </div>
                </Card>

                <section className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Matched Donors</span>
                        <span className={styles.summaryValue}>{filteredDonors.length}</span>
                        <span className={styles.summaryMeta}>
                            Live count based on current interpretation
                        </span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Total Giving</span>
                        <span className={styles.summaryValue}>
                            {formatCurrency(totalGiving)}
                        </span>
                        <span className={styles.summaryMeta}>
                            Combined lifetime giving in the filtered set
                        </span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Average Age</span>
                        <span className={styles.summaryValue}>{averageAge}</span>
                        <span className={styles.summaryMeta}>
                            Useful for audience calibration and messaging
                        </span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Average Engagement</span>
                        <span className={styles.summaryValue}>{averageEngagement}</span>
                        <span className={styles.summaryMeta}>
                            Most common region: {dominantRegion}
                        </span>
                    </div>
                </section>

                {pillOptions.length > 0 ? (
                    <section className={styles.pillSection}>
                        <p className={styles.pillLabel}>Interpreted filters</p>
                        <PillContainer
                            id="interpreted-filters"
                            options={pillOptions}
                            onRequestRemovePill={(
                                _event: unknown,
                                data?: { option?: { id?: string } },
                            ) => {
                                if (!data?.option?.id) {
                                    return;
                                }

                                const removedFilterId = data.option.id;
                                setDismissedFilterIds((currentIds) => [
                                    ...currentIds,
                                    removedFilterId,
                                ]);
                            }}
                        />
                    </section>
                ) : null}

                <section className={styles.resultsSection}>
                    <Card
                        className={styles.resultsCard}
                        heading="Matched donor records"
                        hasNoHeader
                    >
                        <PageHeader
                            icon={
                                <Icon
                                    assistiveText={{ label: "Matched donors" }}
                                    category="standard"
                                    name="contact"
                                />
                            }
                            info={`${filteredDonors.length} donors ready for segmentation`}
                            joined
                            label="Results"
                            title={`${filteredDonors.length} Matched Donors`}
                            variant="related-list"
                        />
                        <div className={styles.tableWrap}>
                            <TypedDataTable
                                id="donor-list-preview-table"
                                items={tableItems}
                                joined
                                onSort={handleSort}
                                search={query}
                                stackedHorizontal
                            >
                                <DataTableColumn
                                    isSorted={sortState.property === "fullName"}
                                    label="Name"
                                    primaryColumn
                                    property="fullName"
                                    sortable
                                    sortDirection={
                                        sortState.property === "fullName"
                                            ? sortState.direction
                                            : undefined
                                    }
                                />
                                <DataTableColumn
                                    isSorted={sortState.property === "age"}
                                    label="Age"
                                    property="age"
                                    sortable
                                    sortDirection={
                                        sortState.property === "age"
                                            ? sortState.direction
                                            : undefined
                                    }
                                />
                                <DataTableColumn label="Location" property="location" />
                                <DataTableColumn label="Demographics" property="demographic" />
                                <DataTableColumn label="Religion" property="religion" />
                                <DataTableColumn
                                    isSorted={sortState.property === "donorTier"}
                                    label="Tier"
                                    property="donorTier"
                                    sortable
                                    sortDirection={
                                        sortState.property === "donorTier"
                                            ? sortState.direction
                                            : undefined
                                    }
                                />
                                <DataTableColumn
                                    isSorted={sortState.property === "totalGiving"}
                                    label="Total Giving"
                                    property="totalGiving"
                                    sortable
                                    sortDirection={
                                        sortState.property === "totalGiving"
                                            ? sortState.direction
                                            : undefined
                                    }
                                />
                                <DataTableColumn
                                    isSorted={sortState.property === "engagementScore"}
                                    label="Engagement"
                                    property="engagementScore"
                                    sortable
                                    sortDirection={
                                        sortState.property === "engagementScore"
                                            ? sortState.direction
                                            : undefined
                                    }
                                />
                                <DataTableColumn
                                    label="Preferred Channel"
                                    property="preferredChannel"
                                />
                                <DataTableColumn
                                    isSorted={sortState.property === "crmSource"}
                                    label="CRM"
                                    property="crmSource"
                                    sortable
                                    sortDirection={
                                        sortState.property === "crmSource"
                                            ? sortState.direction
                                            : undefined
                                    }
                                />
                            </TypedDataTable>
                            {filteredDonors.length === 0 ? (
                                <div className={styles.emptyState}>
                                    No mocked donors match the current criteria. Adjust the
                                    prompt, remove an interpreted pill, or try a broader region,
                                    religion, or giving threshold.
                                </div>
                            ) : null}
                        </div>
                    </Card>

                    <Card className={styles.savedCard} heading="List output" hasNoHeader>
                        <div className={styles.savedBody}>
                            <div className={styles.savedPanel}>
                                <h2 className={styles.savedTitle} style={{ color: "#fff" }}>
                                    {savedList ? savedList.name : "No list snapshot saved yet"}
                                </h2>
                                <p className={styles.savedMeta} style={{ color: "rgba(255,255,255,0.82)" }}>
                                    {savedList
                                        ? `${savedList.count} donors captured on ${savedList.createdAt}`
                                        : "Use Create List to save the current audience definition as a reusable donor list snapshot."}
                                </p>
                            </div>

                            <div className={styles.traitGrid}>
                                <div className={styles.traitCard}>
                                    <strong>Primary region</strong>
                                    <span>{dominantRegion}</span>
                                </div>
                                <div className={styles.traitCard}>
                                    <strong>Most common religion</strong>
                                    <span>
                                        {commonValue(filteredDonors.map((donor) => donor.religion))}
                                    </span>
                                </div>
                                <div className={styles.traitCard}>
                                    <strong>Top channel</strong>
                                    <span>
                                        {commonValue(
                                            filteredDonors.map((donor) => donor.preferredChannel),
                                        )}
                                    </span>
                                </div>
                                <div className={styles.traitCard}>
                                    <strong>Average gift size</strong>
                                    <span>
                                        {savedList ? savedList.averageGift : formatCurrency(0)}
                                    </span>
                                </div>
                            </div>

                            {savedList ? (
                                <>
                                    <div>
                                        <p className={styles.pillLabel}>Saved criteria</p>
                                        <ul className={styles.savedList}>
                                            {savedList.criteria.map((criterion) => (
                                                <li key={criterion}>{criterion}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <p className={styles.pillLabel}>
                                            Suggested campaign angles
                                        </p>
                                        <ul className={styles.savedList}>
                                            {savedList.topTraits.length > 0 ? (
                                                savedList.topTraits.map((trait) => (
                                                    <li key={trait}>{trait}</li>
                                                ))
                                            ) : (
                                                <li>
                                                    Broaden the criteria to surface more donor signals.
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.emptyState}>
                                    The page is already evaluating the mocked cdp.json dataset.
                                    Saving a list snapshot gives product stakeholders a concrete
                                    artifact to validate before wiring this flow to a live CDP or
                                    CRM.
                                </div>
                            )}
                        </div>
                    </Card>
                </section>
            </main>
        </div>
    );
};

export default Home;
