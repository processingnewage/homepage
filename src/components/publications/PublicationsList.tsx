'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn, getMonthName } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import { renderDescriptionBadges } from '@/lib/ui_utils';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(publications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [publications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {type.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Publications Grid */}
            <div className="space-y-6">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => {
                        const venue = pub.journal || pub.conference;
                        const month = getMonthName(pub.month);

                        return (
                            <motion.article
                                key={pub.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 * index }}
                                className="group relative overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:border-accent/40 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                {/* Accent bar */}
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent via-accent/70 to-accent/20"
                                />

                                <div className="pl-6 pr-5 py-5">
                                    {/* Type badge + year */}
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-accent/10 text-accent-dark dark:bg-accent/15 dark:text-accent-light">
                                            {pub.type.replace('-', ' ')}
                                        </span>
                                        <span className="text-xs font-semibold tracking-widest text-neutral-400 dark:text-neutral-500">
                                            {pub.year}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-serif font-semibold text-base sm:text-lg text-primary leading-snug mb-2 transition-colors duration-200 group-hover:text-accent-dark dark:group-hover:text-accent-light">
                                        {pub.title}
                                    </h3>

                                    {/* Authors */}
                                    <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                        {pub.authors.map((author, idx) => (
                                            <span key={idx}>
                                                <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                    {author.name}
                                                </span>
                                                {author.isCorresponding && (
                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>†</sup>
                                                )}
                                                {idx < pub.authors.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </p>

                                    {/* Venue · month · description */}
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 dark:text-neutral-500">
                                        {venue && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <BookOpenIcon className="h-4 w-4 text-accent/70" />
                                                <span className="italic font-medium text-neutral-700 dark:text-neutral-400">{venue}</span>
                                            </span>
                                        )}
                                        {month && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarIcon className="h-4 w-4 text-accent/70" />
                                                {month}
                                            </span>
                                        )}
                                        {pub.description && renderDescriptionBadges(pub.description)}
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
