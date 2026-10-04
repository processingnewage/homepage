'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    AcademicCapIcon,
    ArrowDownTrayIcon,
    ArrowTopRightOnSquareIcon,
    BookOpenIcon,
    CalendarIcon,
    ClipboardDocumentIcon,
    CodeBracketIcon,
    DocumentTextIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import { cn, getMonthName } from '@/lib/utils';
import { renderDescriptionBadges, ICON_BUTTON, ICON_BUTTON_ACTIVE } from '@/lib/ui_utils';
import { PAPER_ASSET_URL_PREFIX } from '@/lib/assets';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? "/#publications" : "/publications"}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {publications.map((pub, index) => {
                    const venue = pub.journal || pub.conference;
                    const month = getMonthName(pub.month);
                    const isAbstractOpen = expandedAbstractId === pub.id;
                    const isBibtexOpen = expandedBibtexId === pub.id;

                    return (
                        <motion.article
                            key={pub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.06 * index }}
                            className="group relative flex h-full flex-row overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            {/* Preview image on the left: fixed 4:3 box, never stretched by the card height */}
                            <div className="relative aspect-[4/3] w-2/5 shrink-0 self-start overflow-hidden bg-white dark:bg-neutral-800">
                                {pub.preview ? (
                                    <Image
                                        src={`${PAPER_ASSET_URL_PREFIX}${pub.preview}`}
                                        alt={pub.title}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 1024px) 40vw, 320px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-100 to-neutral-200 px-2 text-neutral-400 dark:from-neutral-800 dark:to-neutral-900">
                                        <PhotoIcon className="h-7 w-7 shrink-0" />
                                        <span className="text-center text-[10px] font-medium uppercase leading-tight tracking-wider">
                                            {pub.type.replace('-', ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                                {/* Eyebrow: type + year */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-dark dark:text-accent">
                                        {pub.type.replace('-', ' ')}
                                    </span>
                                    <span className="ml-auto shrink-0 text-xs font-semibold tracking-widest text-neutral-400 dark:text-neutral-500">
                                        {pub.year}
                                    </span>
                                </div>

                                <h3
                                    className="mt-1.5 font-serif text-base font-semibold leading-snug text-primary transition-colors duration-200 group-hover:text-accent-dark dark:group-hover:text-accent-light"
                                    title={pub.title}
                                >
                                    {pub.title}
                                </h3>

                                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    {pub.authors.map((author, idx) => (
                                        <span key={idx}>
                                            <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                {author.name}
                                            </span>
                                            {author.isCorresponding && (
                                                <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                            )}
                                            {idx < pub.authors.length - 1 && ', '}
                                        </span>
                                    ))}
                                </p>

                                {/* Venue · month · quality tags · inline actions */}
                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-600 dark:text-neutral-500">
                                    {venue && (
                                        <span className="inline-flex min-w-0 items-center gap-1.5">
                                            <AcademicCapIcon className="h-4 w-4 shrink-0 text-accent/70" />
                                            <span className="truncate italic font-medium text-neutral-700 dark:text-neutral-400">{venue}</span>
                                        </span>
                                    )}
                                    {month && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarIcon className="h-4 w-4 text-accent/70" />
                                            {month}
                                        </span>
                                    )}
                                    {pub.description && renderDescriptionBadges(pub.description)}
                                    {(pub.doi || pub.pdfUrl || pub.code || pub.abstract || pub.bibtex) && (
                                        <span className="inline-flex flex-wrap items-center gap-1.5">
                                            {pub.doi && (
                                                <a
                                                    href={`https://doi.org/${pub.doi}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={ICON_BUTTON}
                                                    title="DOI"
                                                    aria-label="DOI"
                                                >
                                                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                                </a>
                                            )}
                                            {pub.code && (
                                                <a
                                                    href={pub.code}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={ICON_BUTTON}
                                                    title={messages.publications.code}
                                                    aria-label={messages.publications.code}
                                                >
                                                    <CodeBracketIcon className="h-4 w-4" />
                                                </a>
                                            )}
                                            {pub.abstract && (
                                                <button
                                                    onClick={() => setExpandedAbstractId(isAbstractOpen ? null : pub.id)}
                                                    className={cn(ICON_BUTTON, isAbstractOpen && ICON_BUTTON_ACTIVE)}
                                                    title={messages.publications.abstract}
                                                    aria-label={messages.publications.abstract}
                                                    aria-expanded={isAbstractOpen}
                                                >
                                                    <DocumentTextIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            {pub.bibtex && (
                                                <button
                                                    onClick={() => setExpandedBibtexId(isBibtexOpen ? null : pub.id)}
                                                    className={cn(ICON_BUTTON, isBibtexOpen && ICON_BUTTON_ACTIVE)}
                                                    title={messages.publications.bibtex}
                                                    aria-label={messages.publications.bibtex}
                                                    aria-expanded={isBibtexOpen}
                                                >
                                                    <BookOpenIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            {pub.pdfUrl && (
                                                <a
                                                    href={pub.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={ICON_BUTTON}
                                                    title={messages.publications.pdf}
                                                    aria-label={messages.publications.pdf}
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                                </a>
                                            )}
                                        </span>
                                    )}
                                </div>

                                {/* Expandable abstract / bibtex */}
                                <AnimatePresence initial={false}>
                                    {isAbstractOpen && pub.abstract ? (
                                        <motion.div
                                            key="abstract"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 overflow-hidden"
                                        >
                                            <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3.5 text-sm leading-relaxed text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                                {pub.abstract}
                                            </div>
                                        </motion.div>
                                    ) : null}
                                    {isBibtexOpen && pub.bibtex ? (
                                        <motion.div
                                            key="bibtex"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 overflow-hidden"
                                        >
                                            <div className="relative rounded-lg border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-700 dark:bg-neutral-800">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(pub.bibtex || '');
                                                    }}
                                                    className="absolute right-2 top-2 rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-500 shadow-sm transition-colors hover:text-accent dark:border-neutral-600 dark:bg-neutral-700"
                                                    title={messages.common.copyToClipboard}
                                                    aria-label={messages.common.copyToClipboard}
                                                >
                                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                                </button>
                                                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words pr-8 font-mono text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                    {pub.bibtex}
                                                </pre>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </motion.section>
    );
}
