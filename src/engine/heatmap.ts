import type { CommitData, HeatmapResult, HeatmapCell } from './types';
import { DAY_NAMES_FULL } from '../utils/format';

export function analyzeHeatmap(commits: CommitData[]): HeatmapResult {
    const cells: HeatmapCell[] = [];
    const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));

    commits.forEach(c => {
        const d = new Date(c.date);
        const day = d.getUTCDay();
        const hour = d.getUTCHours();
        grid[day][hour]++;
    });

    let maxCount = 0;
    let peakDay = 0, peakHour = 0;

    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const count = grid[day][hour];
            cells.push({ day, hour, count });
            if (count > maxCount) {
                maxCount = count;
                peakDay = day;
                peakHour = hour;
            }
        }
    }

    return {
        cells,
        maxCount,
        totalCommits: commits.length,
        peakDay: DAY_NAMES_FULL[peakDay],
        peakHour,
    };
}
