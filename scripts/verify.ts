import { spawn } from 'child_process';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

interface Task {
  name: string;
  cmd: string;
  args: string[];
  timeout: number;
}

interface TaskResult {
  name: string;
  code: number;
  output: string;
  fullOutput: string;
  duration: number;
  timedOut: boolean;
}

const tasks: Task[] = [
  { name: 'LINT', cmd: 'pnpm', args: ['lint'], timeout: 15000 },
  { name: 'TYPECHECK', cmd: 'pnpm', args: ['typecheck'], timeout: 15000 },
  { name: 'TESTS', cmd: 'pnpm', args: ['test:cov'], timeout: 15000 },
  { name: 'INTEGRATION', cmd: 'pnpm', args: ['test:integration'], timeout: 15000 }
];

function runTask(task: Task): Promise<TaskResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const proc = spawn(task.cmd, task.args, { stdio: 'pipe' });
    let output = '';
    let summaryOutput = '';
    let timedOut = false;
    
    proc.stdout?.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      
      // Extract key summary lines
      if (chunk.includes('% Coverage report') || 
          chunk.includes('All files') ||
          chunk.includes('% Stmts') ||
          chunk.includes('% Branch') ||
          chunk.includes('% Funcs') ||
          chunk.includes('% Lines') ||
          chunk.includes('✖') ||
          chunk.includes('problems') ||
          chunk.includes('Test Files') ||
          chunk.includes(' Tests ') ||
          chunk.includes(' passed') ||
          chunk.includes(' failed') ||
          chunk.includes('Duration') ||
          chunk.match(/^\s*\d+\.\d+\s*\|\s*\d+\.\d+\s*\|\s*\d+\.\d+\s*\|\s*\d+\.\d+/)) {
        summaryOutput += chunk;
      }
    });
    
    proc.stderr?.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      
      // Extract error summaries
      if (chunk.includes('✖') ||
          chunk.includes('problems') ||
          chunk.includes('failed') ||
          chunk.includes('Exit status')) {
        summaryOutput += chunk;
      }
    });
    
    // Timeout protection
    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
      
      // Force kill if SIGTERM doesn't work
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      }, 2000);
    }, task.timeout);
    
    proc.on('close', (code) => {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      if (timedOut) {
        resolve({ 
          name: task.name, 
          code: -1, 
          output: `TIMEOUT after ${task.timeout}ms\n${summaryOutput || output}`,
          fullOutput: output,
          duration,
          timedOut: true
        });
      } else {
        resolve({ 
          name: task.name, 
          code: code ?? -1, 
          output: summaryOutput || output,
          fullOutput: output,
          duration,
          timedOut: false
        });
      }
    });
  });
}

async function main(): Promise<void> {
  console.log('starting  lint, typecheck, tests, and integration checks');
  const results = await Promise.allSettled(tasks.map(runTask));
  
  console.log('SUMMARY');
  
  let hasFailures = false;
  let summaryLines: string[] = [];
  let coverageStatus = '';
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const r = result.value;
      let status: string;
      let nameColor: keyof typeof colors;
      let summaryText = '';
      
      if (r.code === 0) {
        status = colorize('✅ PASSED', 'green');
        nameColor = 'green';
        
        // Extract coverage info for successful tests
        if (tasks[index].name === 'TESTS') {
          // Domain coverage
          const domainCoverageMatch = r.output.match(/All files\s*\|\s*(\d+\.\d+)/);
          if (domainCoverageMatch) {
            const coverage = parseFloat(domainCoverageMatch[1]);
            if (coverage >= 75) {
              coverageStatus += `Domain: ${coverage}% ✅ `;
            } else {
              coverageStatus += `Domain: ${coverage}% ❌ (< 75%) `;
              hasFailures = true;
            }
          }
          
          // Edge coverage (also in TESTS output)
          const edgeCoverageMatch = r.output.match(/All files\s*\|\s*100\s*\|\s*100\s*\|\s*100\s*\|\s*100/);
          if (edgeCoverageMatch) {
            coverageStatus += `Edge: 100% ✅ `;
          } else {
            // Look for other edge coverage patterns
            const edgeLines = r.output.split('\n').filter(line => line.includes('index.ts') && line.includes('|'));
            if (edgeLines.length > 0) {
              const edgeLine = edgeLines[0];
              const edgeMatch = edgeLine.match(/(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)/);
              if (edgeMatch) {
                const [, stmts, branch, funcs, lines] = edgeMatch;
                const minCoverage = Math.min(parseInt(stmts), parseInt(branch), parseInt(funcs), parseInt(lines));
                if (minCoverage >= 70) {
                  coverageStatus += `Edge: ${minCoverage}% ✅ `;
                } else {
                  coverageStatus += `Edge: ${minCoverage}% ❌ (< 70%) `;
                  hasFailures = true;
                }
              }
            }
          }
        }
        
        // Extract test counts for successful tests
        if (tasks[index].name === 'TESTS') {
          const testMatch = r.output.match(/Tests\s+(\d+) passed/);
          summaryText = testMatch ? `SUCCESS ${testMatch[1]} passed` : 'SUCCESS';
        } else if (tasks[index].name === 'INTEGRATION') {
          const integrationMatch = r.output.match(/(\d+) passed/);
          summaryText = integrationMatch ? `SUCCESS ${integrationMatch[1]} passed` : 'SUCCESS';
        } else {
          summaryText = 'SUCCESS';
        }
      } else if (r.timedOut) {
        status = colorize('⏰ TIMEOUT', 'yellow');
        nameColor = 'yellow';
        summaryText = 'TIMEOUT';
      } else {
        status = colorize('❌ FAILED', 'red');
        nameColor = 'red';
        
        // Extract problem counts
        if (tasks[index].name === 'LINT') {
          const problemMatch = r.output.match(/(\d+) problems/);
          summaryText = problemMatch ? `${problemMatch[1]} problems` : 'FAILED';
        } else if (tasks[index].name === 'TYPECHECK') {
          const errorCount = (r.fullOutput.match(/error TS/g) || []).length;
          summaryText = errorCount > 0 ? `${errorCount} problems FAILED` : 'FAILED';
        } else {
          summaryText = 'FAILED';
        }
      }
      
      const taskName = tasks[index].name.toLowerCase();
      const displayName = taskName === 'tests' ? 'test' : taskName;
      summaryLines.push(`${displayName}: ${r.code === 0 ? '✅' : '❌'} ${summaryText}`);
      
      if (r.code !== 0) {
        hasFailures = true;
      }
    } else {
      const taskName = tasks[index].name.toLowerCase();
      const displayName = taskName === 'tests' ? 'test' : taskName;
      summaryLines.push(`${displayName}: ❌ PROMISE FAILED`);
      hasFailures = true;
    }
  });
  
  // Add coverage status
  if (coverageStatus) {
    const cleanCoverage = coverageStatus.trim().replace(/ ✅$/, ''); // Remove trailing checkmark
    summaryLines.push(`coverage: ✅ ${cleanCoverage}`);
  }
  
  // Print summary with line breaks
  summaryLines.forEach(line => console.log(line));
  
  if (hasFailures) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error(`💥 ${colorize('Verification script failed:', 'red')}`, error);
  process.exit(1);
});