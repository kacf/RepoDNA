import type { CommitData, LanguageData, CodingPersonality } from './types';

export function analyzeCodingPersonality(commits: CommitData[], languages: LanguageData): CodingPersonality {
    if (!commits.length) {
        return {
            type: 'ghost', title: 'The Ghost', description: 'No commits found. This repo is a mystery.',
            traits: [], commitStyle: 'None', activeHours: 'Unknown', topLanguage: 'Unknown', avgCommitSize: 'N/A',
        };
    }

    // Analyze commit times
    const hourBuckets = new Array(24).fill(0);
    const dayBuckets = new Array(7).fill(0);
    commits.forEach(c => {
        const d = new Date(c.date);
        hourBuckets[d.getUTCHours()]++;
        dayBuckets[d.getUTCDay()]++;
    });

    // Determine active hours
    const nightCommits = hourBuckets.slice(0, 6).reduce((a, b) => a + b, 0);
    const morningCommits = hourBuckets.slice(6, 12).reduce((a, b) => a + b, 0);
    const afternoonCommits = hourBuckets.slice(12, 18).reduce((a, b) => a + b, 0);
    const eveningCommits = hourBuckets.slice(18, 24).reduce((a, b) => a + b, 0);
    const total = commits.length;

    const timeSlots = [
        { name: 'Night Owl', value: nightCommits },
        { name: 'Early Bird', value: morningCommits },
        { name: 'Afternoon Coder', value: afternoonCommits },
        { name: 'Evening Hacker', value: eveningCommits },
    ];
    timeSlots.sort((a, b) => b.value - a.value);
    const activeHours = timeSlots[0].name;

    // Commit message analysis
    const avgMsgLen = commits.reduce((sum, c) => sum + c.message.split('\n')[0].length, 0) / total;
    const hasConventional = commits.filter(c => /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf)(\(.+\))?:/.test(c.message)).length;
    const conventionalRatio = hasConventional / total;

    // Weekend vs weekday
    const weekendCommits = dayBuckets[0] + dayBuckets[6];
    const weekendRatio = weekendCommits / total;

    // Commit frequency
    const dates = commits.map(c => new Date(c.date).toISOString().split('T')[0]);
    const uniqueDays = new Set(dates).size;
    const commitsPerDay = total / Math.max(uniqueDays, 1);

    // Language analysis
    const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    const topLanguage = langEntries[0]?.[0] || 'Unknown';
    const langDiversity = langEntries.length;

    // Determine personality type
    let type: string, title: string, description: string;

    if (conventionalRatio > 0.6 && avgMsgLen > 30) {
        type = 'architect';
        title = 'The Architect';
        description = 'Methodical, structured, and disciplined. Commits follow conventions and tell a clear story.';
    } else if (weekendRatio > 0.35 && (nightCommits / total) > 0.25) {
        type = 'nocturnal';
        title = 'The Nocturnal';
        description = 'Codes when the world sleeps. Weekends and late nights fuel the best work.';
    } else if (commitsPerDay > 5) {
        type = 'speedrunner';
        title = 'The Speedrunner';
        description = 'Rapid-fire commits, fast iteration loops. Moves fast and ships faster.';
    } else if (langDiversity >= 5) {
        type = 'polyglot';
        title = 'The Polyglot';
        description = 'Comfortable across multiple languages and paradigms. A true full-stack thinker.';
    } else if (avgMsgLen < 15) {
        type = 'minimalist';
        title = 'The Minimalist';
        description = 'Brief commit messages, lean code. Lets the code speak for itself.';
    } else if (weekendRatio < 0.1) {
        type = 'professional';
        title = 'The Professional';
        description = 'Strictly weekday commits. Treats coding as craft with clear work-life boundaries.';
    } else {
        type = 'explorer';
        title = 'The Explorer';
        description = 'Balanced contributor with a curious, adaptive coding style.';
    }

    const traits = [
        { name: 'Discipline', value: Math.min(conventionalRatio * 100 + (avgMsgLen > 40 ? 20 : 0), 100), label: conventionalRatio > 0.5 ? 'Conventional' : 'Freeform' },
        { name: 'Night Activity', value: Math.min((nightCommits / total) * 200, 100), label: `${Math.round((nightCommits / total) * 100)}% night commits` },
        { name: 'Consistency', value: Math.min((uniqueDays / Math.max(commits.length, 1)) * 300, 100), label: `${uniqueDays} active days` },
        { name: 'Weekend Warrior', value: Math.min(weekendRatio * 250, 100), label: `${Math.round(weekendRatio * 100)}% on weekends` },
        { name: 'Language Diversity', value: Math.min(langDiversity * 15, 100), label: `${langDiversity} languages` },
        { name: 'Velocity', value: Math.min(commitsPerDay * 15, 100), label: `${commitsPerDay.toFixed(1)} commits/day` },
    ];

    const commitStyle = conventionalRatio > 0.5 ? 'Conventional Commits' :
        avgMsgLen > 50 ? 'Descriptive' :
            avgMsgLen < 15 ? 'Terse' : 'Casual';

    const avgCommitSize = commitsPerDay > 5 ? 'Small & Frequent' :
        commitsPerDay > 2 ? 'Medium' : 'Large & Infrequent';

    return { type, title, description, traits, commitStyle, activeHours, topLanguage, avgCommitSize };
}
