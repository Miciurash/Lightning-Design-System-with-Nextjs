import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import donorData from "../data/cdp.json";
import {
  analyzePrompt,
  commonValue,
  findSlashContext,
  formatCurrency,
  promptExamples,
  searchSlashFields,
  searchSlashValues,
  slashFieldDefinitions,
  sortDonors,
  unique,
  type DonorRecord,
  type PromptHighlight,
  type PromptHighlightKind,
  type SlashFieldId,
  type SlashFieldSuggestion,
  type SlashValueSuggestion,
} from "../lib/audienceStudio";
import styles from "../styles/DonorBuilderV2.module.css";

const donors = donorData as DonorRecord[];

const v2PromptExamples = [
  "Find /region west coast donors over 50 who prefer /channel text and care about /affinity schools.",
  "Prioritize /tier legacy donors in /state Texas with /engagement high.",
  "Show /segment young families in the northeast with giving over $25k.",
  ...promptExamples,
];

const initialPrompt = v2PromptExamples[0];
const shortcutFields: SlashFieldId[] = [
  "region",
  "state",
  "tier",
  "channel",
  "affinity",
  "age",
  "giving",
  "engagement",
];

type PromptSegment = {
  key: string;
  text: string;
  kind?: PromptHighlightKind;
  label?: string;
};

type SuggestionItem =
  | ({ kind: "field" } & SlashFieldSuggestion)
  | ({ kind: "value" } & SlashValueSuggestion);

type MetricCardProps = {
  label: string;
  value: string;
  note: string;
};

const MetricCard = ({ label, value, note }: MetricCardProps) => (
  <article className={styles.metricCard}>
    <span className={styles.metricLabel}>{label}</span>
    <strong className={styles.metricValue}>{value}</strong>
    <span className={styles.metricNote}>{note}</span>
  </article>
);

const buildPromptSegments = (
  query: string,
  highlights: PromptHighlight[],
): PromptSegment[] => {
  const segments: PromptSegment[] = [];
  const sortedHighlights = [...highlights].sort(
    (left, right) => left.start - right.start,
  );
  let cursor = 0;

  sortedHighlights.forEach((highlight) => {
    if (cursor < highlight.start) {
      segments.push({
        key: `plain-${cursor}`,
        text: query.slice(cursor, highlight.start),
      });
    }

    segments.push({
      key: highlight.id,
      text: query.slice(highlight.start, highlight.end),
      kind: highlight.kind,
      label: highlight.label,
    });

    cursor = highlight.end;
  });

  if (cursor < query.length) {
    segments.push({
      key: `plain-${cursor}`,
      text: query.slice(cursor),
    });
  }

  if (query.endsWith("\n")) {
    segments.push({
      key: "trailing-space",
      text: " ",
    });
  }

  return segments;
};

const truncatePrompt = (value: string, limit = 140) =>
  value.length <= limit ? value : `${value.slice(0, limit).trimEnd()}...`;

const Home: NextPage = () => {
  const [draftQuery, setDraftQuery] = useState(initialPrompt);
  const [caretIndex, setCaretIndex] = useState(initialPrompt.length);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mirrorRef = useRef<HTMLDivElement | null>(null);

  const promptAnalysis = useMemo(() => analyzePrompt(draftQuery), [draftQuery]);
  const activeFilters = promptAnalysis.filters;

  const filteredDonors = useMemo(
    () =>
      donors.filter((donor) =>
        activeFilters.every((filter) => filter.matches(donor)),
      ),
    [activeFilters],
  );

  const totalGiving = useMemo(
    () => filteredDonors.reduce((sum, donor) => sum + donor.totalGiving, 0),
    [filteredDonors],
  );

  const averageGift = useMemo(
    () =>
      filteredDonors.length > 0
        ? formatCurrency(Math.round(totalGiving / filteredDonors.length))
        : formatCurrency(0),
    [filteredDonors.length, totalGiving],
  );

  const averageEngagement = useMemo(() => {
    if (filteredDonors.length === 0) {
      return "0";
    }

    const totalScore = filteredDonors.reduce(
      (sum, donor) => sum + donor.engagementScore,
      0,
    );

    return String(Math.round(totalScore / filteredDonors.length));
  }, [filteredDonors]);

  const dominantRegion = useMemo(
    () => commonValue(filteredDonors.map((donor) => donor.region)),
    [filteredDonors],
  );

  const dominantReligion = useMemo(
    () => commonValue(filteredDonors.map((donor) => donor.religion)),
    [filteredDonors],
  );

  const preferredChannel = useMemo(
    () => commonValue(filteredDonors.map((donor) => donor.preferredChannel)),
    [filteredDonors],
  );

  const topAffinities = useMemo(() => {
    const counts = filteredDonors
      .flatMap((donor) => donor.affinityTags)
      .reduce<Record<string, number>>((accumulator, affinityTag) => {
        accumulator[affinityTag] = (accumulator[affinityTag] ?? 0) + 1;
        return accumulator;
      }, {});

    return Object.entries(counts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
  }, [filteredDonors]);

  const topDonors = useMemo(
    () =>
      sortDonors(filteredDonors, {
        property: "totalGiving",
        direction: "desc",
      }).slice(0, 5),
    [filteredDonors],
  );

  const promptSegments = useMemo(
    () => buildPromptSegments(draftQuery, promptAnalysis.highlights),
    [draftQuery, promptAnalysis.highlights],
  );

  const semanticInterpretations = useMemo(
    () =>
      unique(
        promptAnalysis.highlights
          .filter(
            (highlight) =>
              highlight.kind === "semantic" && Boolean(highlight.canonicalValue),
          )
          .map(
            (highlight) =>
              `${draftQuery.slice(highlight.start, highlight.end)} -> ${highlight.canonicalValue}`,
          ),
      ),
    [draftQuery, promptAnalysis.highlights],
  );

  const audienceNarrative = useMemo(() => {
    if (!draftQuery.trim()) {
      return "Start with a prompt. Type / to target a specific field, describe the donor you want in plain language, and the canvas will tighten live.";
    }

    if (activeFilters.length === 0) {
      return "The prompt does not resolve to structured filters yet. Try clearer metrics like giving over $25k, or use /region, /channel, /tier, and /affinity to guide the parser.";
    }

    if (filteredDonors.length === 0) {
      return "The current brief is narrower than the mocked CDP data. Relax one criterion, swap in a broader value, or remove a slash field to recover audience volume.";
    }

    const leadingAffinity = topAffinities[0]?.name ?? "mission fit";

    return `${filteredDonors.length} donors match the current prompt. The center of gravity is ${dominantRegion}, ${dominantReligion} is the most common faith profile, and ${preferredChannel.toLowerCase()} is the strongest response channel. The list leans into ${leadingAffinity.toLowerCase()} themes with an average gift of ${averageGift}.`;
  }, [
    activeFilters.length,
    averageGift,
    dominantRegion,
    dominantReligion,
    draftQuery,
    filteredDonors.length,
    preferredChannel,
    topAffinities,
  ]);

  const campaignAngles = useMemo(() => {
    if (activeFilters.length === 0) {
      return [
        "Lead with one or two slash fields first, then add natural language around who these donors are and what you want from the audience.",
        "Use semantic language if that is how your team thinks. Phrases like west coast, text, or legacy will still resolve into structured filters when they match.",
        "If the result set is too small, remove one constraint and watch the canvas recover in real time.",
      ];
    }

    const angles: string[] = [];

    if (topAffinities[0]) {
      angles.push(
        `Lead the first touch with ${topAffinities[0].name.toLowerCase()} proof points instead of a generic case for support.`,
      );
    }

    if (preferredChannel !== "None") {
      angles.push(
        `Make ${preferredChannel.toLowerCase()} the primary channel and reserve secondary channels for follow-up or reinforcement.`,
      );
    }

    if (filteredDonors.length > 0 && filteredDonors.length <= 12) {
      angles.push(
        "Treat this as a concierge cohort: fewer names, tighter sequencing, and higher-touch stewardship.",
      );
    } else {
      angles.push(
        "The cohort is broad enough for a test-and-learn sequence with two or three tailored message angles.",
      );
    }

    if (dominantRegion !== "None") {
      angles.push(
        `Use ${dominantRegion.toLowerCase()} market cues, testimonials, or local events so the outreach feels specific.`,
      );
    }

    return angles.slice(0, 3);
  }, [
    activeFilters.length,
    dominantRegion,
    filteredDonors.length,
    preferredChannel,
    topAffinities,
  ]);

  const canvasTitle = useMemo(() => {
    if (activeFilters.length > 0) {
      return activeFilters
        .slice(0, 2)
        .map((filter) => filter.label)
        .join(" + ");
    }

    return "Live audience canvas";
  }, [activeFilters]);

  const slashContext = useMemo(
    () => findSlashContext(draftQuery, caretIndex),
    [caretIndex, draftQuery],
  );

  const suggestions = useMemo<SuggestionItem[]>(() => {
    if (!slashContext) {
      return [];
    }

    if (slashContext.mode === "field") {
      return searchSlashFields(slashContext.fieldToken)
        .slice(0, 8)
        .map((field) => ({
          ...field,
          kind: "field" as const,
        }));
    }

    if (!slashContext.resolvedFieldId) {
      return [];
    }

    return searchSlashValues(slashContext.resolvedFieldId, slashContext.valueText)
      .slice(0, 8)
      .map((value) => ({
        ...value,
        kind: "value" as const,
      }));
  }, [slashContext]);

  const activeSlashField = useMemo(
    () =>
      slashContext?.resolvedFieldId
        ? slashFieldDefinitions.find(
            (field) => field.id === slashContext.resolvedFieldId,
          ) ?? null
        : null,
    [slashContext],
  );

  const activeSuggestionIndex =
    suggestions.length === 0
      ? 0
      : Math.min(selectedSuggestionIndex, suggestions.length - 1);

  const syncPromptScroll = () => {
    if (!textareaRef.current || !mirrorRef.current) {
      return;
    }

    mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
    mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  useEffect(() => {
    syncPromptScroll();
  }, [draftQuery]);

  const focusPromptAt = (nextQuery: string, nextCaret: number) => {
    setDraftQuery(nextQuery);
    setCaretIndex(nextCaret);

    const scheduleFocus =
      typeof window !== "undefined"
        ? window.requestAnimationFrame
        : (callback: FrameRequestCallback) => setTimeout(callback, 0);

    scheduleFocus(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCaret, nextCaret);
      syncPromptScroll();
    });
  };

  const applySuggestion = (suggestion: SuggestionItem) => {
    if (!slashContext) {
      return;
    }

    const suffix = draftQuery.slice(slashContext.end);

    if (suggestion.kind === "field") {
      const preservedValue = slashContext.valueText.trimStart();
      const needsTrailingSpace =
        !preservedValue &&
        suffix.length > 0 &&
        !/^[\s/.,!?)]/.test(suffix);
      const replacement = `/${suggestion.id}${preservedValue ? ` ${preservedValue}` : " "}${needsTrailingSpace ? " " : ""}`;
      const nextQuery =
        draftQuery.slice(0, slashContext.start) + replacement + suffix;
      focusPromptAt(nextQuery, slashContext.start + replacement.length);
      return;
    }

    if (!slashContext.resolvedFieldId) {
      return;
    }

    const needsSpacer = suffix.length > 0 && !/^[\s/.,!?)]/.test(suffix);
    const replacement = `/${slashContext.resolvedFieldId} ${suggestion.insertText}${needsSpacer ? " " : ""}`;
    const nextQuery =
      draftQuery.slice(0, slashContext.start) + replacement + suffix;
    focusPromptAt(nextQuery, slashContext.start + replacement.length);
  };

  const handlePromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!slashContext || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedSuggestionIndex((current) =>
        current === suggestions.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedSuggestionIndex((current) =>
        current === 0 ? suggestions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Tab" || event.key === "Enter") {
      event.preventDefault();
      applySuggestion(suggestions[activeSuggestionIndex] ?? suggestions[0]);
    }
  };

  const updateCaretIndex = () => {
    setCaretIndex(textareaRef.current?.selectionStart ?? 0);
  };

  const insertFieldShortcut = (fieldId: SlashFieldId) => {
    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? draftQuery.length;
    const selectionEnd = textarea?.selectionEnd ?? selectionStart;
    const needsLeadingSpace =
      selectionStart > 0 &&
      !/\s/.test(draftQuery[selectionStart - 1] ?? "") &&
      draftQuery[selectionStart - 1] !== "/";
    const insertion = `${needsLeadingSpace ? " " : ""}/${fieldId} `;
    const nextQuery =
      draftQuery.slice(0, selectionStart) +
      insertion +
      draftQuery.slice(selectionEnd);

    focusPromptAt(nextQuery, selectionStart + insertion.length);
  };

  const highlightClassByKind: Record<PromptHighlightKind, string> = {
    field: styles.highlightField,
    value: styles.highlightValue,
    semantic: styles.highlightSemantic,
    numeric: styles.highlightNumeric,
    keyword: styles.highlightKeyword,
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Audience Studio V2</title>
        <meta
          name="description"
          content="A prompt-first donor audience builder with slash field search, inline semantic highlighting, and a live results canvas."
        />
      </Head>

      <main className={styles.shell}>
        <section className={styles.promptColumn}>
          <header className={styles.hero}>
            <nav className={styles.versionNav} aria-label="Version navigation">
              <Link className={styles.versionLink} href="/">
                Current
              </Link>
              <Link className={styles.versionLink} href="/v1">
                V1
              </Link>
              <span className={styles.versionCurrent}>V2</span>
            </nav>

            <p className={styles.eyebrow}>Audience Studio</p>
            <h1 className={styles.heroTitle}>
              Prompt-first segmentation with inline field search.
            </h1>
            <p className={styles.heroText}>
              Type the audience you want as a prompt. Use <code>/</code> to
              search fields, describe the value you expect in plain language,
              and the matched terms will light up in the prompt even when the
              parser resolves them semantically.
            </p>
          </header>

          <section className={styles.promptCard}>
            <div className={styles.promptTop}>
              <div className={styles.statusRow}>
                <span className={styles.statusPill}>
                  {filteredDonors.length} donors matched
                </span>
                <span
                  className={`${styles.statusPill} ${styles.statusPillMuted}`}
                >
                  {activeFilters.length} recognized filters
                </span>
                <span
                  className={`${styles.statusPill} ${styles.statusPillMuted}`}
                >
                  {semanticInterpretations.length} semantic matches
                </span>
              </div>

              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => focusPromptAt("", 0)}
              >
                Clear prompt
              </button>
            </div>

            <div className={styles.promptHeader}>
              <div>
                <h2 className={styles.promptTitle}>Prompt composer</h2>
                <p className={styles.promptText}>
                  Start with natural language, then add slash fields anywhere in
                  the sentence when you want more control.
                </p>
              </div>
            </div>

            <div className={styles.promptSurface}>
              <div
                ref={mirrorRef}
                className={styles.promptMirror}
                aria-hidden="true"
              >
                {draftQuery ? (
                  promptSegments.map((segment) =>
                    segment.kind ? (
                      <span
                        key={segment.key}
                        className={highlightClassByKind[segment.kind]}
                        title={segment.label}
                      >
                        {segment.text}
                      </span>
                    ) : (
                      <span key={segment.key}>{segment.text}</span>
                    ),
                  )
                ) : (
                  <span className={styles.promptPlaceholder}>
                    Example: Find /region west coast donors over 50 who prefer
                    /channel text and care about /affinity schools.
                  </span>
                )}
              </div>

              <textarea
                ref={textareaRef}
                className={styles.promptInput}
                value={draftQuery}
                onChange={(event) => {
                  setDraftQuery(event.target.value);
                  setCaretIndex(event.target.selectionStart ?? 0);
                }}
                onClick={updateCaretIndex}
                onKeyDown={handlePromptKeyDown}
                onKeyUp={updateCaretIndex}
                onScroll={syncPromptScroll}
                onSelect={updateCaretIndex}
                placeholder=" "
                spellCheck={false}
                rows={10}
              />
            </div>

            <div className={styles.promptHintRow}>
              <p className={styles.promptHint}>
                {slashContext
                  ? slashContext.mode === "field"
                    ? "Search a field to insert, then keep typing the value you want."
                    : `Searching values for ${activeSlashField?.label ?? slashContext.resolvedFieldId}.`
                  : "Type / to search fields. Enter or Tab accepts the selected suggestion."}
              </p>
              {activeSlashField ? (
                <span className={styles.helperBadge}>
                  {activeSlashField.placeholder}
                </span>
              ) : null}
            </div>

            {slashContext ? (
              <section className={styles.slashPanel}>
                <div className={styles.slashHeader}>
                  <div>
                    <h3 className={styles.slashTitle}>
                      {slashContext.mode === "field"
                        ? "Field search"
                        : `${activeSlashField?.label ?? "Field"} values`}
                    </h3>
                    <p className={styles.slashText}>
                      {slashContext.mode === "field"
                        ? "Choose a field, then describe the value you expect."
                        : activeSlashField?.description ??
                          "Choose a value to replace the current slash query."}
                    </p>
                  </div>
                </div>

                {suggestions.length > 0 ? (
                  <div className={styles.suggestionList}>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.kind}-${suggestion.id}`}
                        type="button"
                        className={`${styles.suggestionButton} ${
                          index === activeSuggestionIndex
                            ? styles.suggestionActive
                            : ""
                        }`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <div className={styles.suggestionLabelRow}>
                          <span className={styles.suggestionLabel}>
                            {suggestion.kind === "field"
                              ? `/${suggestion.id}`
                              : suggestion.label}
                          </span>
                          <span className={styles.suggestionMeta}>
                            {suggestion.kind === "field"
                              ? suggestion.valueType
                              : suggestion.semantic
                                ? "semantic"
                                : "value"}
                          </span>
                        </div>
                        <span className={styles.suggestionNote}>
                          {suggestion.kind === "field"
                            ? suggestion.description
                            : suggestion.note}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    No direct suggestions yet. Try a clearer field name or a
                    broader value description.
                  </div>
                )}
              </section>
            ) : null}

            <div className={styles.chipRow}>
              {activeFilters.length > 0 ? (
                activeFilters.map((filter) => (
                  <span key={filter.id} className={styles.filterChip}>
                    {filter.label}
                  </span>
                ))
              ) : (
                <span className={styles.emptyState}>
                  No structured filters resolved yet.
                </span>
              )}
            </div>
          </section>

          <div className={styles.helperGrid}>
            <section className={styles.helperCard}>
              <h3 className={styles.helperTitle}>Field shortcuts</h3>
              <p className={styles.helperText}>
                Insert a slash field at the current cursor position.
              </p>
              <div className={styles.shortcutGrid}>
                {shortcutFields.map((fieldId) => (
                  <button
                    key={fieldId}
                    type="button"
                    className={styles.shortcutButton}
                    onClick={() => insertFieldShortcut(fieldId)}
                  >
                    /{fieldId}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.helperCard}>
              <h3 className={styles.helperTitle}>Example prompts</h3>
              <p className={styles.helperText}>
                Start from one of these and keep editing in place.
              </p>
              <div className={styles.exampleList}>
                {v2PromptExamples.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className={styles.exampleButton}
                    onClick={() => focusPromptAt(prompt, prompt.length)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.helperCard}>
              <h3 className={styles.helperTitle}>Semantic resolutions</h3>
              <p className={styles.helperText}>
                These phrases were mapped to structured values instead of taken
                literally.
              </p>
              {semanticInterpretations.length > 0 ? (
                <div className={styles.semanticList}>
                  {semanticInterpretations.map((interpretation) => (
                    <span key={interpretation} className={styles.semanticItem}>
                      {interpretation}
                    </span>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No semantic mappings yet. Try phrases like west coast, text,
                  legacy, or schools.
                </div>
              )}
            </section>
          </div>
        </section>

        <aside className={styles.canvas}>
          <div className={styles.canvasTop}>
            <p className={styles.canvasEyebrow}>Results Canvas</p>
            <h2 className={styles.canvasTitle}>{canvasTitle}</h2>
            <p className={styles.canvasText}>
              The prompt drives this canvas directly. Edit the brief on the left
              and the matched cohort updates immediately.
            </p>
            <p className={styles.promptQuote}>
              {draftQuery.trim()
                ? truncatePrompt(draftQuery)
                : "No prompt entered yet."}
            </p>
          </div>

          <div className={styles.metricGrid}>
            <MetricCard
              label="Matched donors"
              value={String(filteredDonors.length)}
              note="Current audience count"
            />
            <MetricCard
              label="Average gift"
              value={averageGift}
              note="Mean gift size in the cohort"
            />
            <MetricCard
              label="Avg engagement"
              value={averageEngagement}
              note="Average engagement score"
            />
            <MetricCard
              label="Primary region"
              value={dominantRegion}
              note="Strongest geographic signal"
            />
          </div>

          <section className={styles.canvasCard}>
            <h3 className={styles.canvasCardTitle}>Audience narrative</h3>
            <p className={styles.canvasCardText}>{audienceNarrative}</p>
          </section>

          <section className={styles.canvasCard}>
            <h3 className={styles.canvasCardTitle}>Campaign moves</h3>
            <ul className={styles.angleList}>
              {campaignAngles.map((angle) => (
                <li key={angle} className={styles.angleItem}>
                  {angle}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.canvasCard}>
            <h3 className={styles.canvasCardTitle}>Resolved signal map</h3>
            <div className={styles.tagList}>
              <span className={styles.tag}>Religion: {dominantReligion}</span>
              <span className={styles.tag}>Channel: {preferredChannel}</span>
              <span className={styles.tag}>Region: {dominantRegion}</span>
              {topAffinities.map((affinity) => (
                <span key={affinity.name} className={styles.tag}>
                  {affinity.name} ({affinity.count})
                </span>
              ))}
              {semanticInterpretations.slice(0, 3).map((interpretation) => (
                <span
                  key={interpretation}
                  className={`${styles.tag} ${styles.tagSemantic}`}
                >
                  {interpretation}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.canvasCard}>
            <h3 className={styles.canvasCardTitle}>Top donors in scope</h3>
            {topDonors.length > 0 ? (
              <div className={styles.donorList}>
                {topDonors.map((donor) => (
                  <article key={donor.id} className={styles.donorCard}>
                    <div className={styles.donorNameRow}>
                      <div>
                        <h4 className={styles.donorName}>{donor.fullName}</h4>
                        <p className={styles.donorMeta}>
                          {donor.city}, {donor.state} · {donor.donorTier}
                        </p>
                      </div>
                      <span className={styles.donorBadge}>
                        {donor.preferredChannel}
                      </span>
                    </div>

                    <div className={styles.donorNumbers}>
                      <div className={styles.numberGroup}>
                        <span className={styles.numberLabel}>Total giving</span>
                        <strong className={styles.numberValue}>
                          {formatCurrency(donor.totalGiving)}
                        </strong>
                      </div>
                      <div className={styles.numberGroup}>
                        <span className={styles.numberLabel}>Engagement</span>
                        <strong className={styles.numberValue}>
                          {donor.engagementScore}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.tagList}>
                      {unique(donor.affinityTags)
                        .slice(0, 2)
                        .map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                No donor profiles match the current prompt.
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
};

export default Home;
