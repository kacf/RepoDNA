import type { ComplexityFile, CityResult, CityBlock, CityBuilding } from './types';
import { complexityColor } from '../utils/colors';

export function buildCity(complexityFiles: ComplexityFile[]): CityResult {
    if (!complexityFiles.length) {
        return { blocks: [], buildings: [], totalBuildings: 0 };
    }

    // Group files by top-level directory
    const dirGroups = new Map<string, ComplexityFile[]>();
    complexityFiles.forEach(f => {
        const topDir = f.directory === '.' ? 'root' : f.directory.split('/')[0];
        if (!dirGroups.has(topDir)) dirGroups.set(topDir, []);
        dirGroups.get(topDir)!.push(f);
    });

    const maxLoc = Math.max(...complexityFiles.map(f => f.loc), 1);
    const maxComplexity = Math.max(...complexityFiles.map(f => f.complexity), 1);

    const blocks: CityBlock[] = [];
    const allBuildings: CityBuilding[] = [];

    // Layout blocks in a grid pattern
    const blockSize = 200;
    const blockGap = 40;
    const dirs = [...dirGroups.entries()].sort((a, b) => b[1].length - a[1].length);
    const gridCols = Math.ceil(Math.sqrt(dirs.length));

    dirs.forEach(([dir, files], idx) => {
        const col = idx % gridCols;
        const row = Math.floor(idx / gridCols);
        const blockX = col * (blockSize + blockGap);
        const blockY = row * (blockSize + blockGap);

        // Layout buildings within each block
        const fileCols = Math.ceil(Math.sqrt(files.length));
        const buildingGap = 6;
        const maxBuildingWidth = (blockSize - (fileCols + 1) * buildingGap) / fileCols;
        const buildingWidth = Math.max(Math.min(maxBuildingWidth, 28), 10);

        const buildings: CityBuilding[] = files.slice(0, 64).map((f, fi) => {
            const fc = fi % fileCols;
            const fr = Math.floor(fi / fileCols);
            const x = blockX + buildingGap + fc * (buildingWidth + buildingGap);
            const y = blockY + buildingGap + fr * (buildingWidth + buildingGap);
            const height = Math.max((f.loc / maxLoc) * 120, 8);
            const color = complexityColor(f.complexity, maxComplexity);

            const building: CityBuilding = {
                x, y,
                width: buildingWidth,
                depth: buildingWidth,
                height,
                color,
                path: f.path,
                loc: f.loc,
                complexity: f.complexity,
                directory: dir,
            };
            return building;
        });

        const actualRows = Math.ceil(files.length / fileCols);
        const blockHeight = Math.max(actualRows * (buildingWidth + buildingGap) + buildingGap, blockSize * 0.5);

        blocks.push({
            x: blockX,
            y: blockY,
            width: blockSize,
            depth: blockHeight,
            directory: dir,
            buildings,
        });

        allBuildings.push(...buildings);
    });

    return {
        blocks,
        buildings: allBuildings,
        totalBuildings: allBuildings.length,
    };
}
