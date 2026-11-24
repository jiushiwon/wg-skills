process.argv.splice(2,0,'e2e');
await import('./run.mjs');
