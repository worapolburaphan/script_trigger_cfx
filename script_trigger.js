const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

let scriptInProgress = false;
let currentRunningResource = '';

function startNodeChildProcess (cmd, cwd, cb) {
    return child_process.exec(cmd, { cwd }, cb);
}

const scriptTriggerTask = {
    shouldBuild(resourceName) {
        const numScriptTriggerCommand = GetNumResourceMetadata(resourceName, 'script_trigger')
        if (numScriptTriggerCommand > 0) {
            const numScriptTriggerCached = GetNumResourceMetadata(resourceName, 'script_trigger_cached')
            const scriptTriggerCached = GetResourceMetadata(resourceName, 'script_trigger_cached', 0)

            if (numScriptTriggerCached < 1 || scriptTriggerCached != 'true') return true

			const resourcePath = GetResourcePath(resourceName);

            const triggerCached = path.resolve(resourcePath, '.trigger.cached');
            try {
                if (fs.readFileSync(triggerCached)) {
                    console.log(`^3[script_trigger] ^4Founded cached for ${resourceName}^0`)
                    return false
                }
            } catch {
                console.log(`^3[script_trigger] ^2 Cache not found, proceeding with script trigger.^0`)
                return true
            }
        }
        return false
    },

    build(resourceName, cb) {
        let scriptTrigger = async () => {
            const triggerCommand = GetResourceMetadata(resourceName, 'script_trigger', 0)
            if (scriptInProgress) {
                console.log(`^4script_trigger is busy: we are waiting ${resourceName} to run (${triggerCommand})^0`);
            }
            while (scriptInProgress) {
                await sleep(1000);
            }

            scriptInProgress = true
            currentRunningResource = resourceName
            startNodeChildProcess(triggerCommand, path.resolve(GetResourcePath(resourceName)), (err, stdout, stderr) => {
                if (stdout) {
                    console.log('[script_trigger]', stdout.toString())
                }
                if (stderr) {
                    console.error('[script_trigger]', stderr.toString())
                }
                setImmediate(() => {
                    if (err) {
                        scriptInProgress = false;
                        currentRunningResource = '';
                        cb(false, `^1[script_trigger] Script running failed for (${resourceName})`);
                        return;
                    }

                    const numScriptTriggerCached = GetNumResourceMetadata(resourceName, 'script_trigger_cached')
                    const scriptTriggerCached = GetResourceMetadata(resourceName, 'script_trigger_cached', 0)
        
                    if (numScriptTriggerCached > 0 && scriptTriggerCached == 'true') {
                        const resourcePath = GetResourcePath(resourceName);
                        const cachedFilePath = path.resolve(resourcePath, '.trigger.cached');
                        fs.writeFileSync(cachedFilePath, '');
                    }
                    
                    scriptInProgress = false;
                    currentRunningResource = '';
                    console.log(`^2[script_trigger] Script run success for (${resourceName})^0`)
                    cb(true);
                });
            })
        }

        scriptTrigger()
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

RegisterResourceBuildTaskFactory('z_script_trigger', () => scriptTriggerTask);
