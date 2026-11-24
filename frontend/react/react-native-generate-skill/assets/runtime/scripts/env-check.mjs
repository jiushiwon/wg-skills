process.argv.splice(2,0,'check');
await import('./run.mjs');
