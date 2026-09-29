import packageJson from '../../package.json';
import fs from 'fs';
import path from 'path';

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

export function getLocalCommit(): string {
    try {
        const gitDir = path.join(process.cwd(), '.git');
        const headPath = path.join(gitDir, 'HEAD');
        if (fs.existsSync(headPath)) {
            const head = fs.readFileSync(headPath, 'utf8').trim();
            if (head.startsWith('ref:')) {
                const refRel = head.replace(/^ref:\s*/, '').trim();
                const refPath = path.join(gitDir, refRel);
                if (fs.existsSync(refPath)) {
                    return fs.readFileSync(refPath, 'utf8').trim();
                }
                const packedRefsPath = path.join(gitDir, 'packed-refs');
                if (fs.existsSync(packedRefsPath)) {
                    const packed = fs.readFileSync(packedRefsPath, 'utf8');
                    for (const line of packed.split('\n')) {
                        if (line.includes(refRel)) {
                            return line.split(' ')[0].trim();
                        }
                    }
                }
            } else {
                return head;
            }
        }
    } catch (e) {
        // Ignored
    }
    return '';
}

export async function checkForUpdates(): Promise<{
    currentVersion: string;
    latestVersion: string;
    currentCommit: string;
    latestCommit: string;
    latestCommitMessage: string;
    latestCommitDate: string;
    updateAvailable: boolean;
    changelog: string;
}> {
    const localCommit = getLocalCommit();
    const shortLocalCommit = localCommit ? localCommit.slice(0, 7) : 'local';

    let remoteCommit = '';
    let remoteCommitMessage = '';
    let remoteCommitDate = '';
    let remoteVersion = APP_VERSION;
    let changelog = '';
    let hasRemoteUpdate = false;

    // 1. Check GitHub API for latest commit on main branch
    try {
        const apiRes = await fetch('https://api.github.com/repos/rmrecap/APPAREL-EMPORIUM/commits/main', {
            cache: 'no-store',
            headers: {
                'User-Agent': 'AELBD-Updater-Agent',
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (apiRes.ok) {
            const commitData = await apiRes.json();
            remoteCommit = commitData.sha || '';
            remoteCommitMessage = commitData.commit?.message || 'Updated code changes from repository';
            remoteCommitDate = commitData.commit?.author?.date || '';
        }
    } catch (e: any) {
        console.warn('GitHub API check warning:', e.message);
    }

    // 2. Check remote package.json
    try {
        const pkgRes = await fetch(
            'https://raw.githubusercontent.com/rmrecap/APPAREL-EMPORIUM/main/package.json',
            { cache: 'no-store' }
        );
        if (pkgRes.ok) {
            const remotePkg = await pkgRes.json();
            if (remotePkg?.version) {
                remoteVersion = remotePkg.version;
            }
        }
    } catch (e: any) {
        console.warn('Raw package.json fetch warning:', e.message);
    }

    // 3. Compare version or commit
    const versionDiff = compareVersions(remoteVersion, APP_VERSION);
    const commitDiff = Boolean(
        remoteCommit && localCommit && remoteCommit.slice(0, 7) !== localCommit.slice(0, 7)
    );

    if (versionDiff > 0 || commitDiff) {
        hasRemoteUpdate = true;
    }

    // 4. Fetch Changelog if available
    try {
        const clRes = await fetch(
            'https://raw.githubusercontent.com/rmrecap/APPAREL-EMPORIUM/main/CHANGELOG.md',
            { cache: 'no-store' }
        );
        if (clRes.ok) {
            changelog = await clRes.text();
        }
    } catch (e) {
        // Fallback to commit message
    }

    if (!changelog) {
        changelog = remoteCommitMessage
            ? `Latest Remote Commit:\n${remoteCommitMessage}`
            : 'No changelog description provided.';
    }

    return {
        currentVersion: APP_VERSION,
        latestVersion: remoteVersion,
        currentCommit: shortLocalCommit,
        latestCommit: remoteCommit ? remoteCommit.slice(0, 7) : shortLocalCommit,
        latestCommitMessage: remoteCommitMessage,
        latestCommitDate: remoteCommitDate,
        updateAvailable: hasRemoteUpdate,
        changelog,
    };
}

// Simple semver compare function
function compareVersions(v1: string, v2: string): number {
    const p1 = (v1 || '1.0.0').split('.').map(Number);
    const p2 = (v2 || '1.0.0').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}
