import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import donorData from "../data/cdp.json";
import {
  buildSidebarFilters,
  buildSidebarPills,
  channelOptions,
  commonValue,
  formatCurrency,
  parsePrompt,
  promptExamples,
  regionOptions,
  signalOptions,
  sortDonors,
  tierOptions,
  unique,
  type AudienceSelections,
  type DonorRecord,
  type FilterDescriptor,
  type SelectionOption,
  type SidebarSignalId,
} from "../lib/audienceStudio";
import styles from "../styles/DonorBuilderV2.module.css";

const donors = donorData as DonorRecord[];

const initialPrompt = promptExamples[2];

const initialSelections: AudienceSelections = {
  regions: [],
  tiers: [],
  channels: [],
  signals: [],
};

const toggleValue = <T extends string>(items: T[], value: T) =>
  items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];

type SelectionSectionProps<T extends string> = {
  title: string;
  description: string;
  options: SelectionOption<T>[];
  selected: T[];
  onToggle: (id: T) => void;
};

const SelectionSection = <T extends string>({
  title,
  description,
  options,
  selected,
  onToggle,
}: SelectionSectionProps<T>) => (
  <section className={styles.railSection}>
    <div className={styles.railSectionHeader}>
      <h2 className={styles.railSectionTitle}>{title}</h2>
      <p className={styles.railSectionText}>{description}</p>
    </div>
    <div className={styles.toggleGrid}>
      {options.map((option) => {
        const active = selected.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            className={`${styles.toggleButton} ${
              active ? styles.toggleButtonActive : ""
            }`}
            aria-pressed={active}
            onClick={() => onToggle(option.id)}
          >
            <span className={styles.toggleLabel}>{option.label}</span>
            <span className={styles.toggleNote}>{option.note}</span>
          </button>
        );
      })}
    </div>
  </section>
);

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

const Home: NextPage = () => {
  const [listName, setListName] = useState("Audience Studio / v2");
  const [draftQuery, setDraftQuery] = useState(initialPrompt);
  const [appliedPrompt, setAppliedPrompt] = useState(initialPrompt);
  const [dismissedPromptFilterIds, setDismissedPromptFilterIds] = useState<
    string[]
  >([]);
  const [selections, setSelections] =
    useState<AudienceSelections>(initialSelections);

  const promptFilters = useMemo(
    () => parsePrompt(appliedPrompt),
    [appliedPrompt],
  );

  const activePromptFilters = useMemo(
    () =>
      promptFilters.filter(
        (filter) => !dismissedPromptFilterIds.includes(filter.id),
      ),
    [dismissedPromptFilterIds, promptFilters],
  );

  const sidebarFilters = useMemo(
    () => buildSidebarFilters(selections),
    [selections],
  );

  const sidebarPills = useMemo(
    () => buildSidebarPills(selections),
    [selections],
  );

  const activeFilters = useMemo<FilterDescriptor[]>(
    () => [...activePromptFilters, ...sidebarFilters],
    [activePromptFilters, sidebarFilters],
  );

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

  const audienceNarrative = useMemo(() => {
    if (!appliedPrompt.trim() && activeFilters.length === 0) {
      return "Start with a prompt or use the left rail to shape an audience. The results canvas will summarize the matching donor cohort here.";
    }

    if (filteredDonors.length === 0) {
      return "The current brief is too narrow for the mocked CDP data. Loosen one sidebar selection or broaden the prompt to recover a usable audience.";
    }

    const leadingAffinity = topAffinities[0]?.name ?? "mission fit";

    return `${filteredDonors.length} donors match the current brief. The center of gravity is ${dominantRegion}, ${dominantReligion} is the most common faith profile, and ${preferredChannel.toLowerCase()} is the strongest response channel. The list leans into ${leadingAffinity.toLowerCase()} themes with an average gift of ${averageGift}.`;
  }, [
    activeFilters.length,
    appliedPrompt,
    averageGift,
    dominantRegion,
    dominantReligion,
    filteredDonors.length,
    preferredChannel,
    topAffinities,
  ]);

  const campaignAngles = useMemo(() => {
    const angles: string[] = [];

    if (topAffinities[0]) {
      angles.push(
        `Lead the first touch with ${topAffinities[0].name.toLowerCase()} proof points instead of a generic case for support.`,
      );
    }

    if (preferredChannel !== "None") {
      angles.push(
        `Make ${preferredChannel.toLowerCase()} the primary channel and reserve other channels for follow-up or reinforcement.`,
      );
    }

    if (dominantRegion !== "None") {
      angles.push(
        `Use ${dominantRegion.toLowerCase()} market cues, testimonials, or local events to make the outreach feel specific.`,
      );
    }

    if (filteredDonors.length > 0 && filteredDonors.length <= 12) {
      angles.push(
        "Treat this as a concierge list: fewer names, higher-touch stewardship, tighter sequencing.",
      );
    } else {
      angles.push(
        "This cohort is broad enough for a test-and-learn nurture stream with two or three message variations.",
      );
    }

    return angles.slice(0, 3);
  }, [dominantRegion, filteredDonors.length, preferredChannel, topAffinities]);

  const promptIsDirty = draftQuery.trim() !== appliedPrompt.trim();
  const sidebarSelectionCount =
    selections.regions.length +
    selections.tiers.length +
    selections.channels.length +
    selections.signals.length;

  const handleSubmitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedPrompt(draftQuery.trim());
    setDismissedPromptFilterIds([]);
  };

  const applyExamplePrompt = (prompt: string) => {
    setDraftQuery(prompt);
    setAppliedPrompt(prompt);
    setDismissedPromptFilterIds([]);
  };

  const resetWorkspace = () => {
    setListName("Audience Studio / v2");
    setDraftQuery("");
    setAppliedPrompt("");
    setSelections(initialSelections);
    setDismissedPromptFilterIds([]);
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Audience Studio V2</title>
        <meta
          name="description"
          content="A chat-inspired donor audience builder with a left rail for selections and a results canvas."
        />
      </Head>

      <main className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.railTop}>
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
            <h1 className={styles.sidebarTitle}>
              Chat-led segmentation with a live results canvas.
            </h1>
            <p className={styles.sidebarText}>
              Use the left rail for hard constraints. Submit a prompt in the
              center pane to generate a tighter audience brief on the right.
            </p>
          </div>

          <section className={styles.workspaceCard}>
            <label className={styles.fieldLabel} htmlFor="v2-list-name">
              Canvas name
            </label>
            <input
              id="v2-list-name"
              className={styles.textInput}
              value={listName}
              onChange={(event) => setListName(event.target.value)}
            />

            <div className={styles.workspaceMeta}>
              <div>
                <strong className={styles.metaValue}>{donors.length}</strong>
                <span className={styles.metaLabel}>mocked profiles</span>
              </div>
              <div>
                <strong className={styles.metaValue}>
                  {sidebarSelectionCount}
                </strong>
                <span className={styles.metaLabel}>left-rail selections</span>
              </div>
              <div>
                <strong className={styles.metaValue}>
                  {activeFilters.length}
                </strong>
                <span className={styles.metaLabel}>active criteria</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.resetButton}
              onClick={resetWorkspace}
            >
              Reset workspace
            </button>
          </section>

          <SelectionSection
            title="Region"
            description="Choose geographic gravity for the audience."
            options={regionOptions}
            selected={selections.regions}
            onToggle={(regionId) =>
              setSelections((current) => ({
                ...current,
                regions: toggleValue(current.regions, regionId),
              }))
            }
          />

          <SelectionSection
            title="Donor tier"
            description="Focus the list around capacity and lifecycle stage."
            options={tierOptions}
            selected={selections.tiers}
            onToggle={(tierId) =>
              setSelections((current) => ({
                ...current,
                tiers: toggleValue(current.tiers, tierId),
              }))
            }
          />

          <SelectionSection
            title="Preferred channel"
            description="Shape the audience around likely response motion."
            options={channelOptions}
            selected={selections.channels}
            onToggle={(channelId) =>
              setSelections((current) => ({
                ...current,
                channels: toggleValue(current.channels, channelId),
              }))
            }
          />

          <SelectionSection
            title="Signals"
            description="Layer in operational filters from the side rail."
            options={signalOptions}
            selected={selections.signals}
            onToggle={(signalId) =>
              setSelections((current) => ({
                ...current,
                signals: toggleValue(
                  current.signals,
                  signalId as SidebarSignalId,
                ),
              }))
            }
          />
        </aside>

        <section className={styles.centerPanel}>
          <header className={styles.conversationHeader}>
            <p className={styles.conversationEyebrow}>Prompt Workspace</p>
            <h2 className={styles.conversationTitle}>Audience Copilot</h2>
            <p className={styles.conversationText}>
              The prompt pane behaves like a chat draft. Sidebar selections stay
              live. The right canvas reflects the last submitted prompt plus any
              left-rail constraints.
            </p>
          </header>

          <div className={styles.conversationBody}>
            <div className={styles.statusBar}>
              <span className={styles.statusPill}>
                {filteredDonors.length} donors in canvas
              </span>
              <span
                className={`${styles.statusPill} ${styles.statusPillMuted}`}
              >
                {promptIsDirty ? "Draft changed" : "Prompt synced"}
              </span>
            </div>

            <div className={styles.messageStack}>
              <article className={styles.assistantBubble}>
                <span className={styles.messageLabel}>Audience agent</span>
                <p className={styles.messageText}>
                  I can translate donor instructions into segmentation rules,
                  keep hard filters in the left rail, and feed a planning canvas
                  for campaign review.
                </p>
              </article>

              <article className={styles.userBubble}>
                <span className={styles.messageLabel}>You</span>
                <p className={styles.messageText}>
                  {appliedPrompt.trim()
                    ? appliedPrompt
                    : "No prompt submitted yet. Use the composer below to send a brief."}
                </p>
              </article>

              <article className={styles.assistantBubble}>
                <span className={styles.messageLabel}>
                  Canvas interpretation
                </span>
                <p className={styles.messageText}>{audienceNarrative}</p>
                <p className={styles.messageMeta}>
                  {activePromptFilters.length} prompt filters and{" "}
                  {sidebarSelectionCount} sidebar selections are currently in
                  play.
                </p>

                {activePromptFilters.length > 0 ? (
                  <div className={styles.pillRow}>
                    {activePromptFilters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        className={styles.filterPill}
                        onClick={() =>
                          setDismissedPromptFilterIds((currentIds) => [
                            ...currentIds,
                            filter.id,
                          ])
                        }
                      >
                        <span>{filter.label}</span>
                        <span
                          className={styles.filterPillRemove}
                          aria-hidden="true"
                        >
                          x
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {sidebarPills.length > 0 ? (
                  <div className={styles.pillRow}>
                    {sidebarPills.map((pill) => (
                      <span
                        key={pill.id}
                        className={`${styles.filterPill} ${styles.filterPillMuted}`}
                      >
                        {pill.group}: {pill.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            </div>
          </div>

          <form className={styles.composer} onSubmit={handleSubmitPrompt}>
            <div className={styles.composerHeader}>
              <div>
                <h3 className={styles.composerTitle}>Prompt composer</h3>
                <p className={styles.composerNote}>
                  Write the audience you want as if you were asking an analyst.
                </p>
              </div>
              <button type="submit" className={styles.primaryButton}>
                Send to canvas
              </button>
            </div>

            <textarea
              className={styles.textarea}
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Example: Find Catholic major donors in Texas who gave over $25,000 and still prefer phone outreach."
              rows={6}
            />

            <div className={styles.composerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setDraftQuery(appliedPrompt);
                }}
              >
                Revert to last sent
              </button>
              <span className={styles.messageMeta}>
                Prompt changes require send. Sidebar selections update live.
              </span>
            </div>

            <div className={styles.exampleList}>
              {promptExamples.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className={styles.exampleButton}
                  onClick={() => applyExamplePrompt(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </form>
        </section>

        <aside className={styles.canvas}>
          <div className={styles.canvasTop}>
            <p className={styles.canvasEyebrow}>Results Canvas</p>
            <h2 className={styles.canvasTitle}>
              {listName || "Untitled canvas"}
            </h2>
            <p className={styles.canvasText}>
              Board-facing output for the current brief. Use it to review the
              audience shape before wiring the workflow into a live CDP.
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
            <h3 className={styles.canvasCardTitle}>Dominant signals</h3>
            <div className={styles.tagList}>
              <span className={styles.tag}>Religion: {dominantReligion}</span>
              <span className={styles.tag}>Channel: {preferredChannel}</span>
              {topAffinities.map((affinity) => (
                <span key={affinity.name} className={styles.tag}>
                  {affinity.name} ({affinity.count})
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
                No donor profiles match the current prompt and sidebar
                selections.
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
};

export default Home;
